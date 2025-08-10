
import React from "react";
import { Icon } from "@iconify/react";

const sidebarItems = [
  {
    title: "Sales",
    icon: React.createElement(Icon, {
      icon: "solar:chart-linear",
      className: "w-6 h-6",
    }),
    children: [
      {
        title: "Record Sales",
        url: "/dashboard/record-sales",
      },
      {
        title: "Pending Sales",
        url: "/dashboard/pending-sales",
      },
      {
        title: "Approved Sales",
        url: "/dashboard/approved-sales",
      },
      {
        title: "Rejected",
        url: "/dashboard/rejected-sales",
      },
    ],
  },
  {
    title: "Reports",
    icon: React.createElement(Icon, {
      icon: "solar:pie-chart-linear",
      className: "w-6 h-6",
    }),

    children: [
      {
        title: "Performance",
        url: "/performance-reports",
      },
    ],
  },
  {
    title: "Users",
    icon: React.createElement(Icon, {
      icon: "solar:users-group-two-rounded-linear",
      className: "w-6 h-6",
    }),
    children: [
      {
        title: "CSAs",
        url: "/csas",
      },
      {
        title: "Mechanics",
        url: "/mechanics",
      },
      {
        title: "Oil Specialists",
        url: "/oil-specialists",
      },
      {
        title: "Shop Attendants",
        url: "/shop-attendants",
      },
      {
        title: "Quality Marshalls",
        url: "/quality-marshalls",
      },
      {
        title: "Dealer",
        url: "/dealers",
      },
      {
        title: "Customer Champion",
        url: "/customer-champions",
      },
      {
        title: "Assistant Accountant",
        url: "/assistant-accountants",
      },
      {
        title: "Accountant",
        url: "/accountants",
      },
      {
        title: "Assistant Manager",
        url: "/assistant-managers",
      },
    ],
  },
  {
    title: "Set - Up",
    icon: React.createElement(Icon, {
      icon: "solar:settings-linear",
      className: "w-6 h-6",
    }),
    children: [
      {
        title: "Targets",
        url: "/targets",
      },
    ],
  },
  {
    title: "User",
    icon: React.createElement(Icon, {
      icon: "solar:user-rounded-linear",
      className: "w-6 h-6",
    }),

    children: [
      {
        title: "My Profile",
        url: "/my-profile",
      },
      {
        title: "Change Password",
        url: "/change-password",
      },
    ],
  },
] as const;


export type SidebarItem = {
  title: string;
  icon?: React.ReactNode;
  url?: string;
  position?: "top" | "bottom";
  allowedRoles: string[];
  children?: SidebarItem[];
};

export default sidebarItems;
