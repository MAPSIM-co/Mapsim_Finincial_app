import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  Grid,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import BankAccountTable from "../components/BankAccountTable";
import BankAccountForm from "../components/BankAccountForm";
import TypeTable from "../components/TypeTable";
import TypeForm from "../components/TypeForm";
import MonthlyDepositForm from "../components/MonthlyDepositForm";
import MonthlyDepositTable from "../components/MonthlyDepositTable";
import MonthlyWithdrawalForm from "../components/MonthlyWithdrawalForm";
import MonthlyWithdrawalTable from "../components/MonthlyWithdrawalTable";
import BankBalances from "../components/BankBalances";
import InvestmentFunds from "../pages/InvestmentFunds";
import Graduation from "../components/Graduation";
import Classes from "../components/Classes"; 
import Persons from "../components/Persons"; 
import TuitionTypes from "../components/TuitionTypes"; 
import Cheques from "../components/Cheques"; 
import DebtorCreditorForm from "../components/DebtorCreditorForm"; 
import { api } from "../api/api";

import {
  Home,
  Banknote,
  Layers,
  BarChart3,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  GraduationCap,
  Settings,
  CircleDollarSign,
  Landmark,
  PcCase,
  Handshake,
} from "lucide-react";

// ======================================================
//                     Bank Tab
// ======================================================
const BankTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [editAccount, setEditAccount] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const formRef = useRef(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts/");
      setAccounts(res.data);
    } catch (error) {
      console.error("خطا در دریافت حساب‌ها:", error);
      showSnackbar("خطا در دریافت حساب‌ها", "error");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddOrEditBank = async (form) => {
    try {
      if (editAccount) {
        await api.put(`/accounts/${editAccount.id}`, form);
        showSnackbar("ویرایش حساب با موفقیت انجام شد");
        setEditAccount(null);
      } else {
        await api.post("/accounts/", form);
        showSnackbar("حساب جدید با موفقیت ثبت شد");
      }
      fetchAccounts();
    } catch (error) {
      console.error("خطا در ثبت/ویرایش حساب:", error);
      showSnackbar("خطا در ثبت یا ویرایش حساب", "error");
    }
  };

  const handleEditBank = (acc) => {
    setEditAccount(acc);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteBank = async (id) => {
    if (window.confirm("آیا مطمئن به حذف هستید؟")) {
      try {
        await api.delete(`/accounts/${id}`);
        showSnackbar("حساب با موفقیت حذف شد");
        fetchAccounts();
      } catch (error) {
        console.error("خطا در حذف حساب:", error);
        showSnackbar("خطا در حذف حساب", "error");
      }
    }
  };

  const handleCancel = () => {
    setEditAccount(null);
    showSnackbar("عملیات لغو شد", "info");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Paper sx={{ p: 2 }} elevation={3}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#555" }}>
          مدیریت حساب‌های بانکی
        </Typography>
        <BankAccountTable
          accounts={accounts}
          onEdit={handleEditBank}
          onDelete={handleDeleteBank}
        />
      </Paper>

      <Paper ref={formRef} sx={{ p: 2, mt: 2 }} elevation={3}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7b1fa2" }}>
          {editAccount ? "ویرایش حساب" : "افزودن بانک جدید"}
        </Typography>

        <BankAccountForm
          onSubmit={handleAddOrEditBank}
          initialData={editAccount}
        />

        {editAccount && (
          <Button
            sx={{ mt: 1 }}
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
          >
            انصراف
          </Button>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

// ======================================================
//                     Types Tab
// ======================================================
const TypeTab = ({ typeName }) => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchTypeData = async () => {
    try {
      const res = await api.get(`/${typeName}/`);
      setData(res.data);
    } catch (error) {
      console.error(`خطا در دریافت داده‌های ${typeName}:`, error);
      showSnackbar(`خطا در دریافت داده‌های ${typeName}`, "error");
    }
  };

  useEffect(() => {
    fetchTypeData();
  }, [typeName]);

  const handleAddOrEdit = async (form) => {
    try {
      if (editItem) {
        await api.put(`/${typeName}/${editItem.id}`, form);
        showSnackbar("ویرایش با موفقیت انجام شد");
        setEditItem(null);
      } else {
        await api.post(`/${typeName}/`, form);
        showSnackbar("ثبت جدید با موفقیت انجام شد");
      }
      fetchTypeData();
    } catch (error) {
      console.error("خطا:", error);
      showSnackbar("خطا در ثبت یا ویرایش", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("آیا مطمئن هستید حذف شود؟")) {
      try {
        await api.delete(`/${typeName}/${id}`);
        showSnackbar("حذف با موفقیت انجام شد");
        fetchTypeData();
      } catch (error) {
        console.error("خطا در حذف:", error);
        showSnackbar("خطا در حذف", "error");
      }
    }
  };

  const handleCancel = () => {
    setEditItem(null);
    showSnackbar("عملیات لغو شد", "info");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TypeForm onSubmit={handleAddOrEdit} initialData={editItem} />
      {editItem && (
        <Button
          sx={{ mt: 1 }}
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
        >
          انصراف
        </Button>
      )}
      <TypeTable 
        typeName={typeName}
        data={data}
        onEdit={setEditItem}
        onDelete={handleDelete}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

// ======================================================
//                Monthly Deposits
// ======================================================
const MonthlyDeposits = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [monthlyWithdrawals, setMonthlyWithdrawals] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/monthly-deposits/?skip=0&limit=1000");
      setData(res.data);
    } catch (error) {
      console.error("خطا:", error);
      showSnackbar("خطا در دریافت واریزها", "error");
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get("/monthly-withdrawals/");
      setMonthlyWithdrawals(res.data);
    } catch (error) {
      console.error("خطا در دریافت برداشت‌ها:", error);
      showSnackbar("خطا در دریافت برداشت‌ها", "error");
    }
  };

  useEffect(() => {
    fetchData();
    fetchWithdrawals();
  }, []);

  const handleSubmit = async (form) => {
    try {
      if (editItem) {
        await api.put(`/monthly-deposits/${editItem.id}`, form);
        showSnackbar("ویرایش واریز با موفقیت انجام شد");
        setEditItem(null);
      } else {
        await api.post(`/monthly-deposits/`, form);
        showSnackbar("واریز جدید با موفقیت ثبت شد");
      }
      fetchData();
      fetchWithdrawals();
    } catch (error) {
      console.error("خطا:", error);
      showSnackbar("خطا در ثبت یا ویرایش واریز", "error");
    }
  };

  const handleCancel = () => {
    setEditItem(null);
    showSnackbar("عملیات لغو شد", "info");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <MonthlyDepositForm
        onSubmit={handleSubmit}
        initialData={editItem}
        monthlyDeposits={data}
        monthlyWithdrawals={monthlyWithdrawals}
      />
      {editItem && (
        <Button
          sx={{ mt: 1 }}
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
        >
          انصراف
        </Button>
      )}
      <MonthlyDepositTable
        data={data}
        onEdit={setEditItem}
        onDelete={(id) => api.delete(`/monthly-deposits/${id}`).then(() => {
          showSnackbar("حذف واریز با موفقیت انجام شد");
          fetchData();
        })}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

// ======================================================
//                Monthly Withdrawals
// ======================================================
const MonthlyWithdrawals = () => {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [monthlyDeposits, setMonthlyDeposits] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    api.get("/monthly-withdrawals/").then((r) => setData(r.data));
    api.get("/monthly-deposits/").then((r) => setMonthlyDeposits(r.data));
  }, []);

  const handleSubmit = async (form) => {
    try {
      if (editItem) {
        await api.put(`/monthly-withdrawals/${editItem.id}`, form);
        showSnackbar("ویرایش برداشت با موفقیت انجام شد");
        setEditItem(null);
      } else {
        await api.post(`/monthly-withdrawals/`, form);
        showSnackbar("برداشت جدید با موفقیت ثبت شد");
      }
      const res = await api.get("/monthly-withdrawals/");
      setData(res.data);
    } catch (e) {
      console.error("خطا:", e);
      showSnackbar("خطا در ثبت یا ویرایش برداشت", "error");
    }
  };

  const handleCancel = () => {
    setEditItem(null);
    showSnackbar("عملیات لغو شد", "info");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <MonthlyWithdrawalForm
        onSubmit={handleSubmit}
        initialData={editItem}
        monthlyDeposits={monthlyDeposits}
        withdrawals={data}
      />
      {editItem && (
        <Button
          sx={{ mt: 1 }}
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
        >
          انصراف
        </Button>
      )}
      <MonthlyWithdrawalTable
        data={data}
        onEdit={setEditItem}
        onDelete={(id) =>
          api.delete(`/monthly-withdrawals/${id}`).then(() => {
            showSnackbar("برداشت با موفقیت حذف شد");
            api.get("/monthly-withdrawals/").then((r) => setData(r.data));
          })
        }
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

// ======================================================
//                  Dashboard Component
// ======================================================
function Dashboard() {
  const [selectedTab, setSelectedTab] = useState(0);

  const mainMenu = [
    { title: "بانک‌ها", icon: <Banknote size={22} />, component: <BankTab /> },
    {
      title: "انواع Typeها",
      icon: <Layers size={22} />,
      subMenu: [
        { title: "Type1", component: <TypeTab typeName="type1" /> },
        { title: "Type2", component: <TypeTab typeName="type2" /> },
        { title: "Type3", component: <TypeTab typeName="type3" /> },
        { title: "Type4", component: <TypeTab typeName="type4" /> },
        { title: "Type5", component: <TypeTab typeName="type5" /> },
      ],
    },
    { title: "صندوق‌های سرمایه‌گذاری", icon: <BarChart3 size={22} />, component: <InvestmentFunds /> },
    { title: "واریز ماهیانه", icon: <ArrowDownCircle size={22} />, component: <MonthlyDeposits /> },
    { title: "برداشت ماهیانه", icon: <ArrowUpCircle size={22} />, component: <MonthlyWithdrawals /> },
    { title: "موجودی بانک‌ها", icon: <Wallet size={22} />, component: <BankBalances /> },

    { title: "بدهکار و بستانکار", icon: <Handshake size={22} />, component: <DebtorCreditorForm /> },

    {
      title: "وضعیت کلاس ها و شهریه مدرسه",
      icon: <GraduationCap size={22} />,
      subMenu: [
        { title: "تعریف انواع کلاس" ,icon: <PcCase size={22}/>, component: <TuitionTypes /> },
        { title: "شهریه مدرسه", icon: <PcCase size={22} />, component: <Graduation /> }, 
        // { title: "شهریه مدرسه", component: <TypeTab typeName="school_fee" /> },
        // { title: "شهریه کلاس زبان", component: <TypeTab typeName="language_class" /> },
        // { title: "شهریه کلاس موسیقی", component: <TypeTab typeName="music_class" /> },
        // { title: "شهریه کلاس خصوصی زبان", component: <TypeTab typeName="private_language" /> },
        // { title: "شهریه کلاس خصوصی مدرسه", component: <TypeTab typeName="private_school" /> },
        // { title: "شهریه کلاس ورزشی", component: <TypeTab typeName="sports_class" /> },
        // { title: "شهریه کلاس آموزشی مهارت", component: <TypeTab typeName="skill_training" /> },
      ],
  },

    { title: "چک", icon: <PcCase size={22} />, component: <Cheques /> },
    

    {
    title: "تنظیمات",
    icon: <Settings size={22} />,
    subMenu: [
      { title: "تعریف اشخاص",icon: <Landmark size={22} />, component: <Persons /> }, 
      { title: "انواع کلاس ها آموزشی و تفریحی و مهارتی",icon: <Landmark size={22} />, component: <Classes /> }, 
    ],
  }


    
  ];

  const renderComponent = () => {
    const item = mainMenu[selectedTab];
    if (!item) return null;

    if (item.subMenu)
      return (
        <Grid container spacing={2}>
          {item.subMenu.map((sub, idx) => (
            <Grid key={idx} item xs={12}>
              <Paper sx={{ p: 2 }} elevation={3}>
                <Typography variant="h6">{sub.title}</Typography>
                {sub.component}
              </Paper>
            </Grid>
          ))}
        </Grid>
      );

    return <Paper sx={{ p: 2 }} elevation={3}>{item.component}</Paper>;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <AppBar position="static" sx={{ mb: 3, p: 1 }}>
        <Box display="flex" alignItems="center">
          <img src="/Mapsim_logo.JPG" alt="Logo" style={{ height: 45 }} />
          <Typography variant="h5" sx={{ ml: 2, fontWeight: "bold", color: "#ffcc80" }}>
            Managment Finincial MAPSIM
          </Typography>
        </Box>
      </AppBar>

      <Tabs
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="secondary"
        indicatorColor="secondary"
        sx={{
          mb: 2,
          "& .MuiTab-root": { fontSize: "16px", fontWeight: "bold" },
        }}
      >
        {mainMenu.map((m, i) => (
          <Tab key={i} icon={m.icon} label={m.title} iconPosition="start" />
        ))}
      </Tabs>

      <Box>{renderComponent()}</Box>
    </Container>
  );
}

export default Dashboard;
