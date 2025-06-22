// assets
import {
  DashboardOutlined,
  FileAddFilled,
  EditFilled,
  FundViewOutlined
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
      id: "bus",
      title: "Business Units",
      type: "collapse",
      // url: "/business-units/view",
      children: [
       {
        id: "view-bus",
        title: "View",
        type: "item",
        url: "/business-units/view",
        privileges: [],
        icon: FundViewOutlined,
      },
       {
        id: "create-bus",
        title: "Create",
        type: "item",
        url: "/business-units/create",
        privileges: [],
        icon: FileAddFilled,
       },
       {
        id: "edit-bus",
        title: "Edit",
        type: "item",
        url: "/business-units/edit",
        privileges: [],
        icon: EditFilled,
       }
      ],
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "rules",
      title: "Rules",
      type: "collapse",
      // url: "/rules/view",
      children: [
        {
         id: "view-bus",
         title: "View",
         type: "item",
         url: "/rules/view",
         privileges: [],
         icon: FundViewOutlined,
       },
        {
         id: "create-bus",
         title: "Create",
         type: "item",
         url: "/rules/create",
         privileges: [],
         icon: FileAddFilled,
        },
        {
         id: "edit-bus",
         title: "Edit",
         type: "item",
         url: "/rules/edit",
         privileges: [],
         icon: EditFilled,
        }
       ],
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "tiers",
      title: "Tiers",
      type: "collapse",
      children: [
        {
         id: "view-tiers",
         title: "View",
         type: "item",
         url: "/tiers/view",
         privileges: [],
         icon: FundViewOutlined,
       },
        {
         id: "create-tiers",
         title: "Create",
         type: "item",
         url: "/tiers/create",
         privileges: [],
         icon: FileAddFilled,
        },
        {
         id: "edit-tiers",
         title: "Edit",
         type: "item",
         url: "/tiers/edit",
         privileges: [],
         icon: EditFilled,
        }
      ],
      // url: "/tiers/view",
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "campaigns",
      title: "Campaigns",
      type: "collapse",
      // url: "/campaigns/view",
      children: [
        {
         id: "view-campaigns",
         title: "View",
         type: "item",
         url: "/campaigns/view",
         privileges: [],
         icon: FundViewOutlined,
       },
        {
         id: "create-campaigns",
         title: "Create",
         type: "item",
         url: "/campaigns/create",
         privileges: [],
         icon: FileAddFilled,
        },
        {
         id: "edit-campaigns",
         title: "Edit",
         type: "item",
         url: "/campaigns/edit",
         privileges: [],
         icon: EditFilled,
        }
      ],
      privileges: [],
      icon: DashboardOutlined,
    },
  ],
};

export default menuItems;
