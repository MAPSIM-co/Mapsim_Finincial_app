import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  IconButton, MenuItem , Card, CardContent, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api/api";
import jalaali from "jalaali-js";



/* ---------------- constants ---------------- */

const CLASS_TYPES = [
  { value: "private", label: "خصوصی" },
  { value: "semi_private", label: "نیمه خصوصی" },
  { value: "group", label: "گروهی" },
  { value: "term", label: "ترمیک" },
  { value: "monthly", label: "ماهیانه" },
  { value: "yearly", label: "سالیانه" },
  { value: "session", label: "جلسه‌ای" },
  { value: "package", label: "پکیجی" },
  { value: "online", label: "آنلاین" },
  { value: "offline", label: "حضوری" }
];

const TUITION_TYPES = [
  { value: "school_fee", label: "شهریه مدرسه" },
  { value: "language_class", label: "شهریه کلاس زبان" },
  { value: "music_class", label: "شهریه کلاس موسیقی" },
  { value: "private_language", label: "شهریه کلاس خصوصی زبان" },
  { value: "private_school", label: "شهریه کلاس خصوصی مدرسه" },
  { value: "sports_class", label: "شهریه کلاس ورزشی" },
  { value: "skill_training", label: "شهریه آموزش مهارت" }
];

const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 }, { name: "اردیبهشت", number: 2 },
  { name: "خرداد", number: 3 }, { name: "تیر", number: 4 },
  { name: "مرداد", number: 5 }, { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 }, { name: "آبان", number: 8 },
  { name: "آذر", number: 9 }, { name: "دی", number: 10 },
  { name: "بهمن", number: 11 }, { name: "اسفند", number: 12 }
];


const PAYMENT_TYPES = [
  { value: "cash", label: "نقدی" },
  { value: "cheque", label: "چکی" },
  { value: "installment", label: "قسطی" }
];


/* ---------------- component ---------------- */

export default function TuitionTypes() {
  const [tuitiontypes, setTuitionTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    class_id: "",
    type_name: "",
    type_of_class: "",
    amount: "",
    applicable_for: "",
    type_of_payment: "cash",
    start_date: "",
    end_date: "",
    description: ""
  });




/* ---------------- Jalali ---------------- */

const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { year: j.jy, month: j.jm, day: j.jd };
};

const formatJalali = (dateStr) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d} ${PERSIAN_MONTHS[m - 1]?.name} ${y}`;
};

  /* ---------------- load data ---------------- */

  const loadTuitionTypes = async () => {
    const res = await api.get("/tuition-types/");
    setTuitionTypes(res.data);
  };

  const loadClasses = async () => {
    const res = await api.get("/classes/");
    setClasses(res.data);
  };

  useEffect(() => {
    loadTuitionTypes();
    loadClasses();
  }, []);


  const today = getTodayJalali();


  /* ---------------- helpers ---------------- */

  const getClassName = (id) => {
    const cls = classes.find(c => c.id === id);
    return cls ? cls.name : "-";
  };

  const getClassType = (classtyp) => {
  const class_typ = CLASS_TYPES.find(d => d.value === classtyp);
  return class_typ ? class_typ.label : "-";
};

const getPaymentType = (paymenttyp) => {
  const payment_typ = PAYMENT_TYPES.find(p => p.value === paymenttyp);
  return payment_typ ? payment_typ.label : "-";
};


const getTutuType = (tututype) => {
  const tutu_typ = TUITION_TYPES.find(t => t.value === tututype);
  return tutu_typ ? tutu_typ.label : "-";
};


  const handleOpenForm = (item = null) => {
  const today = getTodayJalali();
  setForm({
    class_id: item?.class_id || "",
    type_name: item?.type_name || "",
    type_of_class: item?.type_of_class || "",
    amount: item?.amount || "",
    applicable_for: item?.applicable_for || "",
    type_of_payment: item?.type_of_payment || "cash",
    description: item?.description || "",
    start_day: item?.start_date ? item.start_date.split("-")[2] : today.day,
    start_month: item?.start_date ? item.start_date.split("-")[1] : today.month,
    start_year: item?.start_date ? item.start_date.split("-")[0] : today.year,
    end_day: item?.end_date ? item.end_date.split("-")[2] : today.day,
    end_month: item?.end_date ? item.end_date.split("-")[1] : today.month,
    end_year: item?.end_date ? item.end_date.split("-")[0] : today.year
  });
  setEditItem(item);
  setOpenForm(true);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  
  const padZero = (num) => String(num).padStart(2, "0");

const handleSubmit = async () => {
  const start_date = `${form.start_year}-${padZero(form.start_month)}-${padZero(form.start_day)}`;
  const end_date = `${form.end_year}-${padZero(form.end_month)}-${padZero(form.end_day)}`;

  const payload = {
    ...form,
    start_date,
    end_date
  };

  if (editItem) {
    await api.put(`/tuition-types/${editItem.id}`, payload);
  } else {
    await api.post("/tuition-types/", payload);
  }

  setOpenForm(false);
  loadTuitionTypes();
};




  const handleDelete = async (id) => {
    if (!window.confirm("حذف شود؟")) return;
    await api.delete(`/tuition-types/${id}`);
    loadTuitionTypes();
  };


  useEffect(() => {
  const t = getTodayJalali();
  setForm(prev => ({
    ...prev,
    start_day: String(t.day),
    start_month: String(t.month),
    start_year: t.year,
    end_day: "",
    end_month: "",
    end_year: ""
  }));
}, []);


// ----------------------- chequeForm -------------------------------

const [openChequeForm, setOpenChequeForm] = useState(false);
const [chequeForm, setChequeForm] = useState({
  type_name: "",
  item_id:null,
  items: "",
  serial_number: "",
  bank: "",
  amount: 0,
  pay_to: "",
  cheque_type: "پرداختی",
  ChequeE_day: "",
  ChequeE_month: "",
  ChequeE_year: "",
  ChequeP_day: "",
  ChequeP_month: "",
  ChequeP_year: ""
});


const handleChequeChange = (e) => {
  const { name, value } = e.target;
  setChequeForm(prev => ({ ...prev, [name]: value }));
};




const handleChequeSubmit = async () => {
  const padZero_cheques = (num) => String(num).padStart(2, "0");
  const today = getTodayJalali();

  const start_day = chequeForm.ChequeE_day || today.day;
  const start_month = chequeForm.ChequeE_month || today.month;
  const start_year = chequeForm.ChequeE_year || today.year;

  const end_day = chequeForm.ChequeP_day || today.day;
  const end_month = chequeForm.ChequeP_month || today.month;
  const end_year = chequeForm.ChequeP_year || today.year;

  const start_date = `${start_year}-${padZero_cheques(start_month)}-${padZero_cheques(start_day)}`;
  const end_date = `${end_year}-${padZero_cheques(end_month)}-${padZero_cheques(end_day)}`;

  const payload = {
    ...chequeForm,
    type_name: chequeForm.type_name || "-",
    issue_date: start_date,
    due_date: end_date
  };

  console.log("payload to API:", payload);
  await api.post("/cheques/", payload);
  setOpenChequeForm(false);
};


const [banks, setBanks] = useState([]);
useEffect(() => {
  const fetchBanks = async () => {
    try {
      const res = await api.get("/accounts/");
      setBanks(res.data); // فرض بر اینکه هر بانک {id, bank_name} دارد
    } catch (error) {
      console.error("خطا در دریافت بانک‌ها:", error);
    }
  };
  fetchBanks();
}, []);




  /* ---------------- render ---------------- */

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
        افزودن کلاس 
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            {/* ⛔️ عنوان ستون‌ها دقیقاً همان‌هایی است که خودت دادی */}
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">دسته کلاس</TableCell>
              <TableCell align="center">شناسه کلاس</TableCell>
              <TableCell align="center">نوع کلاس</TableCell>
              <TableCell align="center">هزینه شهریه کلاس</TableCell>
              <TableCell align="center">ثبت نام برای</TableCell>
              <TableCell align="center">نوع پرداخت شهریه</TableCell>
              <TableCell align="center">تاریخ شروع کلاس</TableCell>
              <TableCell align="center">تاریخ پایان کلاس</TableCell>
              <TableCell align="center">توضیحات کلاس</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tuitiontypes.map(item => (
              <TableRow key={item.id}>
                <TableCell align="center">{item.id}</TableCell>
                <TableCell align="center">{getClassName(item.class_id)}</TableCell>
                <TableCell align="center">{getTutuType(item.type_name)}</TableCell>
                

                {/* 🔥 نمایش name کلاس به‌جای عدد */}
                <TableCell align="center">
                    {/* {item.type_of_class} */}
                  {getClassType(item.type_of_class)}
                </TableCell>

                <TableCell align="center">
                  {item.amount?.toLocaleString()} تومان
                </TableCell>

                <TableCell align="center">{item.applicable_for}</TableCell>

                <TableCell align="center">
                    {getPaymentType(item.type_of_payment)}
                </TableCell>
                
                <TableCell align="center">{item.start_date || "-"}</TableCell>
                <TableCell align="center">{item.end_date || "-"}</TableCell>
                <TableCell align="center">{item.description}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenForm(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- فرم ---------- */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editItem ? "ویرایش شهریه کلاس" : "افزودن شهریه کلاس"}
        </DialogTitle>

        <DialogContent>
          {/* 🔥 ComboBox کلاس */}
          <TextField
            select
            name="class_id"
            label="انتخاب دسته کلاس"
            value={form.class_id}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            {classes.map(cls => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField select fullWidth sx={{ mt: 2 }} name="type_name" label="انتخاب شناسه برای ساخت انگلیسی" value={form.type_name} onChange={handleChange}>
            {TUITION_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>

          
          <TextField select fullWidth sx={{ mt: 2 }} name="type_of_class" label="نوع کلاس" value={form.type_of_class} onChange={handleChange}>
            {CLASS_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>

          <TextField name="amount" label="هزینه شهریه" type="number" value={form.amount} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <TextField name="applicable_for" label="ثبت نام برای" value={form.applicable_for} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
            
            <TextField
                select
                name="type_of_payment"
                label="نوع پرداخت شهریه"
                value={form.type_of_payment}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
                >
                {PAYMENT_TYPES.map(p => (
                    <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
            </TextField>

            {form.type_of_payment === "cheque" && (
            <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setOpenChequeForm(true)}
            >
                افزودن چک
            </Button>
            )}


            <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, mt: 2 }}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'right', pr: 1 }}>تاریخ شروع کلاس</Typography>

                <TextField
                select
                label="روز"
                name="start_day"
                value={form.start_day || ""}
                onChange={handleChange}
                sx={{ minWidth: 100 }}
                >
                <MenuItem value=""><em>روز</em></MenuItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                ))}
                </TextField>

                <TextField
                select
                label="ماه"
                name="start_month"
                value={form.start_month || ""}
                onChange={handleChange}
                sx={{ minWidth: 160 }}
                >
                <MenuItem value=""><em>ماه</em></MenuItem>
                {PERSIAN_MONTHS.map(m => (
                    <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                ))}
                </TextField>

                <TextField
                label="سال"
                name="start_year"
                type="number"
                value={form.start_year || getTodayJalali().year}
                onChange={handleChange}
                sx={{ minWidth: 140 }}
                />
            </CardContent>
            </Card>


            <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, mt: 2 }}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'right', pr: 1 }}>تاریخ پایان کلاس</Typography>

                <TextField
                select
                label="روز"
                name="end_day"
                value={form.end_day || ""}
                onChange={handleChange}
                sx={{ minWidth: 100 }}
                >
                <MenuItem value=""><em>روز</em></MenuItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                ))}
                </TextField>

                <TextField
                select
                label="ماه"
                name="end_month"
                value={form.end_month || ""}
                onChange={handleChange}
                sx={{ minWidth: 160 }}
                >
                <MenuItem value=""><em>ماه</em></MenuItem>
                {PERSIAN_MONTHS.map(m => (
                    <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                ))}
                </TextField>

                <TextField
                label="سال"
                name="end_year"
                type="number"
                value={form.end_year || getTodayJalali().year}
                onChange={handleChange}
                sx={{ minWidth: 140 }}
                />
            </CardContent>
            </Card>


          
          <TextField name="description" label="توضیحات کلاس" value={form.description} onChange={handleChange} multiline rows={3} fullWidth sx={{ mt: 2 }} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit}>ذخیره</Button>
        </DialogActions>
      </Dialog>


     {/* ---------- فرم چک ---------- */}
      <Dialog open={openChequeForm} onClose={() => setOpenChequeForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن چک</DialogTitle>
        <DialogContent>
            <TextField select fullWidth sx={{ mt: 2 }} name="type_name" label="انتخاب دسته بندی چک جهت صدور" value={chequeForm.type_name || ""} onChange={handleChequeChange}>
            {TUITION_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
            <TextField name="items" label="بابت چک" value={chequeForm.items} onChange={handleChequeChange} fullWidth sx={{ mt: 2 }} />
            <TextField name="serial_number" label="شماره سریال چک" value={chequeForm.serial_number} onChange={handleChequeChange} fullWidth sx={{ mt: 2 }} />
            <TextField
                select
                name="bank"
                label="بانک چک"
                value={chequeForm.bank}
                onChange={handleChequeChange}
                fullWidth
                sx={{ mt: 2 }}
                >
                <MenuItem value="">
                    <em>انتخاب بانک</em>
                </MenuItem>
                {banks.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                    {b.bank_name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField name="amount" label="مبلغ چک" type="number" value={chequeForm.amount} onChange={handleChequeChange} fullWidth sx={{ mt: 2 }} />
            <TextField name="pay_to" label="در وجه" value={chequeForm.pay_to} onChange={handleChequeChange} fullWidth sx={{ mt: 2 }} />
            
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, mt: 2 }}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'right', pr: 1 }}>تاریخ صدور چک</Typography>

                <TextField
                select
                label="روز"
                name="ChequeE_day"
                value={chequeForm.ChequeE_day || getTodayJalali().day}
                onChange={handleChequeChange}
                sx={{ minWidth: 100 }}
                >
                <MenuItem value=""><em>روز</em></MenuItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                ))}
                </TextField>

                <TextField
                select
                label="ماه"
                name="ChequeE_month"
                value={chequeForm.ChequeE_month|| getTodayJalali().month}
                onChange={handleChequeChange}
                sx={{ minWidth: 160 }}
                >
                <MenuItem value=""><em>ماه</em></MenuItem>
                {PERSIAN_MONTHS.map(m => (
                    <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                ))}
                </TextField>

                <TextField
                label="سال"
                name="ChequeE_year"
                type="number"
                value={chequeForm.ChequeE_year || getTodayJalali().year}
                onChange={handleChequeChange}
                sx={{ minWidth: 140 }}
                />
            </CardContent>
            </Card>



            <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, mt: 2 }}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'right', pr: 1 }}>تاریخ سر رسید چک</Typography>

                <TextField
                select
                label="روز"
                name="ChequeP_day"
                value={chequeForm.ChequeP_day || getTodayJalali().day}
                onChange={handleChequeChange}
                sx={{ minWidth: 100 }}
                >
                <MenuItem value=""><em>روز</em></MenuItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                ))}
                </TextField>

                <TextField
                select
                label="ماه"
                name="ChequeP_month"
                value={chequeForm.ChequeP_month|| getTodayJalali().month}
                onChange={handleChequeChange}
                sx={{ minWidth: 160 }}
                >
                <MenuItem value=""><em>ماه</em></MenuItem>
                {PERSIAN_MONTHS.map(m => (
                    <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                ))}
                </TextField>

                <TextField
                label="سال"
                name="ChequeP_year"
                type="number"
                value={chequeForm.ChequeP_year || getTodayJalali().year}
                onChange={handleChequeChange}
                sx={{ minWidth: 140 }}
                />
            </CardContent>
            </Card>

            
            {/* <TextField
            select
            name="cheque_type"
            label="نوع چک"
            value={chequeForm.cheque_type}
            onChange={handleChequeChange}
            fullWidth
            sx={{ mt: 2 }}
            >
            <MenuItem value="پرداختی">پرداختی</MenuItem>
            </TextField> */}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenChequeForm(false)}>انصراف</Button>
            <Button variant="contained" onClick={handleChequeSubmit}>ذخیره چک</Button>
        </DialogActions>
        </Dialog>

    </>
  );
}
