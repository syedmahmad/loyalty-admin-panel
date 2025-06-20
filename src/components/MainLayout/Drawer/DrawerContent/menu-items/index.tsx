// assets
import {
  DashboardOutlined,
} from "@ant-design/icons";


// types
import { NavItemType } from "@/types/menu";

// ==============================|| MENU ITEMS ||============================== //

// we only have 2 types of menu items.
// 1- simple items.
// 2- collapsable.
const menuItems: { items: NavItemType[] } = {
  items: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/dashboard",
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "tenants",
      title: "Tenants",
      type: "item",
      url: "/tenants",
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "tiers",
      title: "Tiers",
      type: "item",
      url: "/tiers",
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "campaigns",
      title: "Campaigns",
      type: "item",
      url: "/campaigns",
      privileges: [],
      icon: DashboardOutlined,
    },
  ],
};

export default menuItems;
