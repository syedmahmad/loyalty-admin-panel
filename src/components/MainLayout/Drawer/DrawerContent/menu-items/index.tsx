// assets
import {
  DashboardOutlined,
  MailOutlined,
  WhatsAppOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  UndoOutlined,
  DatabaseOutlined,
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
      id: "templates",
      title: "Email Templates",
      type: "item",
      url: "/templates",
      privileges: [],
      icon: MailOutlined,
    },

    {
      id: "sms-templates",
      title: "SMS Templates",
      type: "item",
      url: "/sms-template",
      privileges: [],
      icon: MessageOutlined,
    },
    {
      id: "whatsapp",
      title: "WhatsApp Templates",
      type: "item",
      url: "/whatsapp",
      privileges: [],
      icon: WhatsAppOutlined,
    },
    {
      id: "categories",
      title: "Categories",
      type: "item",
      url: "/categories",
      privileges: [],
      icon: DatabaseOutlined,
    },
    {
      id: "email-sender",
      title: "Email Sender",
      type: "item",
      url: "/email-sender",
      privileges: [],
      icon: UsergroupAddOutlined,
    },
    {
      id: "sms-sender",
      title: "SMS Sender",
      type: "item",
      url: "/sms-sender",
      privileges: [],
      icon: UsergroupAddOutlined,
    },
    {
      id: "whatsapp-sender",
      title: "Whatsapp Sender",
      type: "item",
      url: "/whatsapp-sender",
      privileges: [],
      icon: UsergroupAddOutlined,
    },
    // {
    //     id: 'client',
    //     title: "Clients",
    //     type: 'item',
    //     url: '/clients',
    //     privileges: [],
    //     icon: UserOutlined
    // },
    {
      id: "dashboard",
      title: "SMS History",
      type: "item",
      url: "/sms-history",
      privileges: [],
      icon: DashboardOutlined,
    },
    {
      id: "emailHistory",
      title: "Email History",
      type: "item",
      url: "/email-history",
      privileges: [],
      icon: MailOutlined,
    },
    {
      id: "whatsapplHistory",
      title: "WhatsApp History",
      type: "item",
      url: "/whatsapp-history",
      privileges: [],
      icon: ClockCircleOutlined,
    },
    {
      id: "csvUpload",
      title: "CSV Upload",
      type: "item",
      url: "/csv-upload",
      privileges: [],
      icon: UploadOutlined,
    },
    {
      id: "unsubscribe-list",
      title: "Unsubscribe List",
      type: "item",
      url: "/unsubscribe-history",
      privileges: [],
      icon: UndoOutlined,
    },
    {
      id: "csvDetails",
      title: "CSV Details",
      type: "item",
      url: "/csv-upload-details",
      privileges: [],
      icon: FileTextOutlined,
    },
  ],
};

export default menuItems;
