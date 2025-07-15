// assets
import {
  DashboardOutlined,
  FileAddFilled,
  EditFilled,
  FundViewOutlined
} from "@ant-design/icons";
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ExtensionIcon from '@mui/icons-material/Extension';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import GroupIcon from '@mui/icons-material/Group';


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
      type: "item",
      url: "/business-units/view",
      // children: [
      //  {
      //   id: "view-bus",
      //   title: "View",
      //   type: "item",
      //   url: "/business-units/view",
      //   privileges: [],
      //   icon: FundViewOutlined,
      // },
      //  {
      //   id: "create-bus",
      //   title: "Create",
      //   type: "item",
      //   url: "/business-units/create",
      //   privileges: [],
      //   icon: FileAddFilled,
      //  },
      //  {
      //   id: "edit-bus",
      //   title: "Edit",
      //   type: "item",
      //   url: "/business-units/edit",
      //   privileges: [],
      //   icon: EditFilled,
      //  }
      // ],
      privileges: [],
      icon: AddBusinessIcon,
    },
    {
      id: "rules",
      title: "Rules",
      type: "item",
      url: "/rules/view",
      // children: [
      //   {
      //    id: "view-bus",
      //    title: "View",
      //    type: "item",
      //    url: "/rules/view",
      //    privileges: [],
      //    icon: FundViewOutlined,
      //  },
      //   {
      //    id: "create-bus",
      //    title: "Create",
      //    type: "item",
      //    url: "/rules/create",
      //    privileges: [],
      //    icon: FileAddFilled,
      //   },
      //   {
      //    id: "edit-bus",
      //    title: "Edit",
      //    type: "item",
      //    url: "/rules/edit",
      //    privileges: [],
      //    icon: EditFilled,
      //   }
      //  ],
      privileges: [],
      icon: ExtensionIcon,
    },
    {
      id: "tiers",
      title: "Tiers",
      type: "item",
      // children: [
      //   {
      //    id: "view-tiers",
      //    title: "View",
      //    type: "item",
      //    url: "/tiers/view",
      //    privileges: [],
      //    icon: FundViewOutlined,
      //  },
      //   {
      //    id: "create-tiers",
      //    title: "Create",
      //    type: "item",
      //    url: "/tiers/create",
      //    privileges: [],
      //    icon: FileAddFilled,
      //   },
      //   {
      //    id: "edit-tiers",
      //    title: "Edit",
      //    type: "item",
      //    url: "/tiers/edit",
      //    privileges: [],
      //    icon: EditFilled,
      //   }
      // ],
      url: "/tiers/view",
      privileges: [],
      icon: CrisisAlertIcon,
    },
     {
      id: "coupons",
      title: "Coupons",
      type: "item",
      url: "/coupons/view",
      privileges: [],
      icon: LoyaltyIcon,
    },
    {
      id: "campaigns",
      title: "Campaigns",
      type: "item",
      url: "/campaigns/view",
      // children: [
      //   {
      //    id: "view-campaigns",
      //    title: "View",
      //    type: "item",
      //    url: "/campaigns/view",
      //    privileges: [],
      //    icon: FundViewOutlined,
      //  },
      //   {
      //    id: "create-campaigns",
      //    title: "Create",
      //    type: "item",
      //    url: "/campaigns/create",
      //    privileges: [],
      //    icon: FileAddFilled,
      //   },
      //   {
      //    id: "edit-campaigns",
      //    title: "Edit",
      //    type: "item",
      //    url: "/campaigns/edit",
      //    privileges: [],
      //    icon: EditFilled,
      //   }
      // ],
      privileges: [],
      icon: CampaignIcon,
    },
    {
      id: "rewards",
      title: "Rewards",
      type: "item",
      url: "/rewards",
      privileges: [],
      icon: EmojiEventsIcon,
    },
    {
      id: "customers",
      title: "Customers",
      type: "item",
      url: "/customers",
      privileges: [],
      icon: GroupIcon,
    },
    {
  id: "analytics",
  title: " Analytics ",
  type: "collapse", 
  icon: GroupIcon,
  children: [
    {
      id: "coupon",
      title: "Coupon Analytic",
      type: "item",
      url: "/analytic/coupon",
      privileges: [],
    },
    {
      id: "loyalty",
      title: "Loyalty Analytic",
      type: "item",
      url: "/analytic/loyalty",
      privileges: [],
    },
     {
      id: "transcation",
      title: "Transcation Analytic",
      type: "item",
      url: "/analytic/transcation",
      privileges: [],
    }
  ]
}


  ],
};

export default menuItems;
