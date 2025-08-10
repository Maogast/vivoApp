const fs     = require('fs')
const path   = require('path')
const xml2js = require('xml2js')

// Accept a filepath or default to metadata.xml in this folder
const filename = process.argv[2] || 'metadata.xml'
const fullPath = path.isAbsolute(filename)
  ? filename
  : path.join(__dirname, filename)

async function main() {
  // 1. Ensure the file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`Cannot find file: ${fullPath}`)
    process.exit(1)
  }

  // 2. Read & strip any junk before the XML declaration
  let raw = fs.readFileSync(fullPath, 'utf8')
  const idx = raw.indexOf('<?xml')
  if (idx >= 0) raw = raw.slice(idx)

  // 3. Parse XML, stripping any namespace prefixes
  const parser = new xml2js.Parser({
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  })
  const doc = await parser.parseStringPromise(raw)

  // 4. Debug: What keys did we get?
  console.log('ROOT KEYS:', Object.keys(doc))

  const edmx = doc.Edmx
  if (!edmx) {
    console.error('No <Edmx> root element found!')
    process.exit(1)
  }
  console.log('EDMX KEYS:', Object.keys(edmx))

  const dataServices = edmx.DataServices
  if (!dataServices) {
    console.error('No <DataServices> element found!')
    process.exit(1)
  }
  console.log('DATASERVICES KEYS:', Object.keys(dataServices))

  // 5. Collect all <Schema> entries
  const schemas = [].concat(dataServices.Schema || [])
  console.log('SCHEMA NAMESPACES:', schemas.map(s => s.$.Namespace))

  // 6. Find the schema that contains the RejectRequest action
  const actionSchema = schemas.find(s => {
    const actions = [].concat(s.Action || [])
    return actions.some(a => a.$.Name === 'RejectRequest')
  })
  if (!actionSchema) {
    console.error('No schema with <Action Name="RejectRequest"> found!')
    process.exit(1)
  }

  // 7. Extract the action and its parameter type
  const action = [].concat(actionSchema.Action)
    .find(a => a.$.Name === 'RejectRequest')
  const actionParamType = action.Parameter.$.Type
  console.log('Action Parameter Type:', actionParamType)

  // 8. Locate the ComplexType definition for that parameter
  const [ns, paramTypeName] = actionParamType.split('.')
  const complexSchema = schemas.find(s => s.$.Namespace === ns)
  if (!complexSchema) {
    console.error(`No schema with Namespace="${ns}" found!`)
    process.exit(1)
  }

  const complexType = [].concat(complexSchema.ComplexType || [])
    .find(ct => ct.$.Name === paramTypeName)
  if (!complexType) {
    console.error(`No <ComplexType Name="${paramTypeName}"> in ${ns}`)
    process.exit(1)
  }

  // 9. Print out the properties of the complex type
  console.log(`\nComplexType ${paramTypeName}:`)
  console.table(
    [].concat(complexType.Property).map(p => ({
      Name:     p.$.Name,
      Type:     p.$.Type,
      Nullable: p.$.Nullable ?? 'true'
    }))
  )

  // 10. Extract the SalesHeader property's type
  const salesProp = [].concat(complexType.Property)
    .find(p => p.$.Name === 'SalesHeader')
  if (!salesProp) {
    console.error(`No property "SalesHeader" in ComplexType "${paramTypeName}"`)
    process.exit(1)
  }
  console.log('\nSalesHeader Type:', salesProp.$.Type)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})