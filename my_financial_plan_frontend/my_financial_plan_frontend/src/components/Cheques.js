import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  IconButton, MenuItem, Card, CardContent, Typography
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { api } from "../api/api";
import jalaali from "jalaali-js";

/* ---------------- constants ---------------- */

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



/* ---------------- component ---------------- */

const toFaNumber = (num) =>
  num?.toString().replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);


export default function ChequePage() {

  /* ---------- states ---------- */

  const [openChequeForm, setOpenChequeForm] = useState(false);
  const [cheques, setCheques] = useState([]);
  const [editingChequeId, setEditingChequeId] = useState(null);
  const [banks, setBanks] = useState([]);

  const [chequeForm, setChequeForm] = useState({
    type_name: "",
    item_id: null,
    items: "",
    serial_number: "",
    bank: "",
    amount: 0,
    pay_to: "",
    cheque_type: "",
    ChequeE_day: "",
    ChequeE_month: "",
    ChequeE_year: "",
    ChequeP_day: "",
    ChequeP_month: "",
    ChequeP_year: ""
  });

  const toFaNumber = (num) =>
  num?.toString().replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

const getRemainingTime = (dueDate) => {
  if (!dueDate) return { text: "-", daysLeft: null };

  const [y, m, d] = dueDate.split("-").map(Number);
  const today = getTodayJalali();

  const totalDays =
    (y * 365 + m * 30 + d) -
    (today.year * 365 + today.month * 30 + today.day);

  if (totalDays < 0) {
    return { text: "⛔ سررسید گذشته", daysLeft: totalDays };
  }

  if (totalDays === 0) {
    return { text: "تا سررسید امروز", daysLeft: 0 };
  }

  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let parts = [];

  if (months > 0) parts.push(`${toFaNumber(months)} ماه`);
  if (days > 0) parts.push(`${toFaNumber(days)} روز`);

  const text = `تا سررسید ${parts.join(" و ")} مانده`;

  return { text, daysLeft: totalDays };
};


  /* ---------- helpers ---------- */

  const handleChequeChange = (e) => {
    const { name, value } = e.target;
    setChequeForm(prev => ({ ...prev, [name]: value }));
  };

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

  /* ---------- load data ---------- */

  const loadCheques = async () => {
    const res = await api.get("/cheques/");
    setCheques(res.data);
  };

  useEffect(() => {
    loadCheques();
    api.get("/accounts/").then(res => setBanks(res.data));
  }, []);

  /* ---------- submit (دست نخورده) ---------- */

  const handleChequeSubmit = async () => {
    const padZero = (num) => String(num).padStart(2, "0");
    const today = getTodayJalali();

    const start_day = chequeForm.ChequeE_day || today.day;
    const start_month = chequeForm.ChequeE_month || today.month;
    const start_year = chequeForm.ChequeE_year || today.year;

    const end_day = chequeForm.ChequeP_day || today.day;
    const end_month = chequeForm.ChequeP_month || today.month;
    const end_year = chequeForm.ChequeP_year || today.year;

    const start_date = `${start_year}-${padZero(start_month)}-${padZero(start_day)}`;
    const end_date = `${end_year}-${padZero(end_month)}-${padZero(end_day)}`;

    const payload = {
      ...chequeForm,
      type_name: chequeForm.type_name || "-",
      issue_date: start_date,
      due_date: end_date
    };

    if (editingChequeId) {
      await api.put(`/cheques/${editingChequeId}`, payload);
    } else {
      await api.post("/cheques/", payload);
    }

    setEditingChequeId(null);
    setOpenChequeForm(false);
    loadCheques();
  };

  /* ---------- edit / delete ---------- */

  const handleEditCheque = (row) => {
    const [sy, sm, sd] = row.issue_date.split("-");
    const [ey, em, ed] = row.due_date.split("-");

    setChequeForm({
      ...row,
      ChequeE_year: sy,
      ChequeE_month: sm,
      ChequeE_day: sd,
      ChequeP_year: ey,
      ChequeP_month: em,
      ChequeP_day: ed
    });

    setEditingChequeId(row.id);
    setOpenChequeForm(true);
  };

  const handleDeleteCheque = async (id) => {
    if (!window.confirm("چک حذف شود؟")) return;
    await api.delete(`/cheques/${id}`);
    loadCheques();
  };


  /* ---------- POP UP ---------- */
  const [alertCheque, setAlertCheque] = useState(null);

  useEffect(() => {
  const urgent = cheques.find(c => {
    const r = getRemainingTime(c.due_date);
    return r.daysLeft !== null && r.daysLeft <= 3 && r.daysLeft >= 0;
  });
  if (urgent) setAlertCheque(urgent);
}, [cheques]);


  /* ---------- render ---------- */

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenChequeForm(true)}>
        افزودن چک
      </Button>

      {/* ---------- table ---------- */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">بابت</TableCell>
              <TableCell align="center">شماره چک</TableCell>
              <TableCell align="center">بانک</TableCell>
              <TableCell align="center">مبلغ</TableCell>
              <TableCell align="center">در وجه</TableCell>
              <TableCell align="center">نوع</TableCell>
              <TableCell align="center"> تاریخ صدور</TableCell>
              <TableCell align="center">تاریخ سررسید</TableCell>
              <TableCell align="center">زمان مانده تا تاریخ سر رسید</TableCell>
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cheques.map(row => (
              <TableRow key={row.id}>
                <TableCell align="center">{row.id}</TableCell>
                <TableCell align="center">{row.items}</TableCell>
                <TableCell align="center">{row.serial_number}</TableCell>
                <TableCell align="center">
                  {banks.find(b => b.id === row.bank)?.bank_name || "-"}
                </TableCell>
                <TableCell align="center">
                  {row.amount?.toLocaleString()} تومان
                </TableCell>
                <TableCell align="center">{row.pay_to}</TableCell>
                <TableCell align="center">{row.cheque_type}</TableCell>
                <TableCell align="center">{formatJalali(row.issue_date)}</TableCell>
                <TableCell align="center">{formatJalali(row.due_date)}</TableCell>

                <TableCell align="center">
                {(() => {
                    const remain = getRemainingTime(row.due_date);

                    let color = "success";
                    if (remain.daysLeft <= 3 && remain.daysLeft >= 0) color = "error";
                    if (remain.daysLeft < 0) color = "grey";

                    return (
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            letterSpacing: "0.02em",
                            whiteSpace: "nowrap",
                            fontFamily: "Vazirmatn, IRANSans, sans-serif",
                            color:
                            color === "error" ? "#d32f2f" :
                            color === "success" ? "#2e7d32" :
                            "#757575"
                        }}
                    >
                        {remain.text}
                    </Typography>

                    );
                })()}
                </TableCell>

                
                <TableCell align="center">
                <TextField
                    select
                    size="small"
                    value={row.status || "در انتظار"}
                    disabled={getRemainingTime(row.due_date).daysLeft > 0}
                    onChange={async (e) => {
                    await api.put(`/cheques/${row.id}`, {
                        ...row,
                        status: e.target.value
                    });
                    loadCheques();
                    }}
                >
                    <MenuItem value="در انتظار">در انتظار</MenuItem>
                    <MenuItem value="پاس شده">پاس شده</MenuItem>
                    <MenuItem value="برگشت خورده">برگشت خورده</MenuItem>
                </TextField>
                </TableCell>


                <TableCell align="center">
                  <IconButton onClick={() => handleEditCheque(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteCheque(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- dialog (فرم خودت) ---------- */}
      <Dialog open={openChequeForm} onClose={() => setOpenChequeForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingChequeId ? "ویرایش چک" : "افزودن چک"}</DialogTitle>
        <DialogContent>

          <TextField
            select fullWidth sx={{ mt: 2 }}
            name="type_name"
            label="انتخاب دسته بندی چک جهت صدور"
            value={chequeForm.type_name || ""}
            onChange={handleChequeChange}
          >
            {TUITION_TYPES.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>

          <TextField name="items" label="بابت چک" fullWidth sx={{ mt: 2 }}
            value={chequeForm.items} onChange={handleChequeChange} />

          <TextField name="serial_number" label="شماره سریال چک" fullWidth sx={{ mt: 2 }}
            value={chequeForm.serial_number} onChange={handleChequeChange} />

          <TextField select name="bank" label="بانک چک" fullWidth sx={{ mt: 2 }}
            value={chequeForm.bank} onChange={handleChequeChange}>
            {banks.map(b => (
              <MenuItem key={b.id} value={b.id}>{b.bank_name}</MenuItem>
            ))}
          </TextField>

          <TextField name="amount" label="مبلغ چک" type="number" fullWidth sx={{ mt: 2 }}
            value={chequeForm.amount} onChange={handleChequeChange} />

          <TextField name="pay_to" label="در وجه" fullWidth sx={{ mt: 2 }}
            value={chequeForm.pay_to} onChange={handleChequeChange} />


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

            <TextField
            select
            name="cheque_type"
            label="نوع چک"
            value={chequeForm.cheque_type}
            onChange={handleChequeChange}
            fullWidth
            sx={{ mt: 2 }}
            >
            <MenuItem value="پرداختی">پرداختی</MenuItem>
            <MenuItem value="دریافتی">دریافتی</MenuItem>
            </TextField>

        </DialogContent>
                <DialogActions>
                <Button onClick={() => setOpenChequeForm(false)}>انصراف</Button>
                <Button variant="contained" onClick={handleChequeSubmit}>ذخیره چک</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!alertCheque} onClose={() => setAlertCheque(null)}>
        <DialogTitle sx={{ color: "red", fontWeight: "bold" }}>
            ⚠️ هشدار سررسید چک
        </DialogTitle>
        <DialogContent>
            <Typography>
            چک به مبلغ <b style={{ color: "#1a7f00ff", fontWeight: "bold" }}>{alertCheque?.amount?.toLocaleString()} تومان</b>
            <br />
            فقط <b style={{ color: "#f80202ff", fontWeight: "bold" }}>{getRemainingTime(alertCheque?.due_date).text}</b> ، لطفا جهت تکمیل حساب خود اقدام نمایید
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: "#2b07e0ff", fontWeight: "bold" }} onClick={() => setAlertCheque(null)}>
            متوجه شدم
            </Button>
        </DialogActions>
        </Dialog>

    </>
  );
}
