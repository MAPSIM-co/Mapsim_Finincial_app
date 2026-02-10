import React, { useState } from "react";
import { Box, Collapse, Typography, Paper } from "@mui/material";
import {
  Banknote,
  Layers,
  ChevronDown,
  ChevronUp,
  Wallet,
  CreditCard,
  BarChart3,
} from "lucide-react";

const menuStyle = {
  p: 2,
  mb: 2,
  borderRadius: "14px",
  cursor: "pointer",
  transition: "0.25s ease",
  bgcolor: "#faf7ff",
  "&:hover": {
    bgcolor: "#f0e6ff",
    transform: "translateY(-2px)",
  },
};

const subItemStyle = {
  p: 1.5,
  pl: 4,
  borderRadius: "10px",
  cursor: "pointer",
  bgcolor: "#ffffff",
  mb: 1,
  transition: "0.2s",
  "&:hover": {
    bgcolor: "#f5eaff",
    transform: "translateX(-5px)",
  },
};

export default function DashboardMenu({ onSelect }) {
  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuClick = (title, hasSubMenu) => {
    if (hasSubMenu) {
      setOpenMenu(openMenu === title ? null : title);
    } else {
      onSelect(title);
    }
  };

  const menuItems = [
    { 
      title: "بانک‌ها", 
      icon: <Banknote size={22} />, 
      component: "bank" 
    },

    {
      title: "انواع Typeها",
      icon: <Layers size={22} />,
      subMenu: [
        { title: "Type1", component: "type1" },
        { title: "Type2", component: "type2" },
        { title: "Type3", component: "type3" },
        { title: "Type4", component: "type4" },
        { title: "Type5", component: "type5" },
      ],
    },

    {
      title: "صندوق‌های سرمایه گذاری",
      icon: <Wallet size={22} />,
      component: "funds",
    },

    {
      title: "وضعیت واریز ماهیانه Typeها",
      icon: <CreditCard size={22} />,
      component: "monthlyDeposit",
    },

    {
      title: "وضعیت برداشت ماهیانه Typeها",
      icon: <CreditCard size={22} />,
      component: "monthlyWithdraw",
    },

    {
      title: "موجودی بانک‌ها",
      icon: <BarChart3 size={22} />,
      component: "balances",
    },

    {
      title: "شهریه مدرسه محمدرضا",
      icon: <graduation-cap size={22} />,
    //   component: "balances",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {menuItems.map((item) => (
        <Paper
          key={item.title}
          sx={menuStyle}
          onClick={() => handleMenuClick(item.title, item.subMenu)}
        >
          {/* === آیتم اصلی === */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: "#7b2cbf" }}>{item.icon}</Box>

              <Typography sx={{ fontSize: "1.1rem", fontWeight: "600" }}>
                {item.title}
              </Typography>
            </Box>

            {item.subMenu && (
              <>
                {openMenu === item.title ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </>
            )}
          </Box>

          {/* === زیرمنو === */}
          {item.subMenu && (
            <Collapse in={openMenu === item.title}>
              <Box sx={{ mt: 2 }}>
                {item.subMenu.map((sub) => (
                  <Paper
                    key={sub.title}
                    sx={subItemStyle}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onSelect(sub.component);
                    }}
                  >
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      {sub.title}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Collapse>
          )}
        </Paper>
      ))}
    </Box>
  );
}
