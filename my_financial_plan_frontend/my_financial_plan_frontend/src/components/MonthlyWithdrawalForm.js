import React, { useState, useEffect } from "react";
import { TextField, Button, Box, MenuItem, Card, CardContent, Typography } from "@mui/material";
import jalaali from "jalaali-js";
import { api } from "../api/api";


const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { day: j.jd, month: j.jm, year: j.jy };
};

const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 }, { name: "اردیبهشت", number: 2 }, { name: "خرداد", number: 3 },
  { name: "تیر", number: 4 }, { name: "مرداد", number: 5 }, { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 }, { name: "آبان", number: 8 }, { name: "آذر", number: 9 },
  { name: "دی", number: 10 }, { name: "بهمن", number: 11 }, { name: "اسفند", number: 12 }
];

const getCurrentPersianYear = () => {
  const today = new Date();
  let year = today.getFullYear() - 621;
  const month = today.getMonth() + 1;
  const day = today.getDate();
  if (month < 3 || (month === 3 && day < 20)) year -= 1;
  return year;
};

const TYPES = ["type1", "type2", "type3", "type4", "type5"];

const MonthlyWithdrawalForm = ({ onSubmit, initialData, monthlyDeposits, withdrawals }) => {

//   const [form, setForm] = useState({
//     type_name: "",
//     topic: "",
//     items: "",
//     allocated_budget: 0,
//     bank: "",
//     amount_withdrawn: 0,
//     transfer_amount: 0,
//     total_out: 0,
//     transfer_bank: "",
//     withdrawal_date: "",
//     withdrawal_day: "",
//     withdrawal_monthNumber: "",
//     withdrawal_year: getCurrentPersianYear(),
//     description: "",
//     this_month_balance: 0,
//     total_balance: 0,
//     remaining_balance: 0,
//   });

  const defaultForm = {
  type_name: "",
  topic: "",
  items: "",
  allocated_budget: 0,
  bank: "",
  amount_withdrawn: 0,
  transfer_amount: 0,
  total_out: 0,
  transfer_bank: "",
  withdrawal_date: "",
  withdrawal_day: "",
  withdrawal_monthNumber: "",
  withdrawal_year: getCurrentPersianYear(),
  description: "",
  this_month_balance: 0,
  total_balance: 0,
  remaining_balance: 0,
};
  const [form, setForm] = useState(defaultForm);

  const resetForm = () => {
  const t = getTodayJalali();
  setForm({
    ...defaultForm,
    withdrawal_day: String(t.day),
    withdrawal_monthNumber: String(t.month),
    withdrawal_year: t.year,
  });
  setSelectedTitle("");
  setIsNegative(false);
};


  const [banks, setBanks] = useState([]);
  const [typeItems, setTypeItems] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [isNegative, setIsNegative] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
            ...prev,
            ...initialData
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (initialData && initialData.items) {
            setSelectedTitle(initialData.items);
        }
    }, [initialData]);


  useEffect(() => {
    api.get("/accounts/").then(res => setBanks(res.data)).catch(() => setBanks([]));
  }, []);

  useEffect(() => {
    if (form.type_name) {
      api.get(`/${form.type_name}/`).then(res => setTypeItems(res.data || [])).catch(() => setTypeItems([]));
      setSelectedTitle("");
    }
  }, [form.type_name]);

  // Auto-fill topic/items/allocated_budget/bank on title select
  const handleTitleSelect = (e) => {
    const val = e.target.value;
    setSelectedTitle(val);
    let id = val;
    if (typeof val === 'string' && val.includes('-')) id = val.split('-').pop();
    const found = typeItems.find((it) => String(it.id) === String(id));
    if (found) {
      setForm((prev) => ({
        ...prev,
        topic: found.topic || prev.topic,
        items: val || prev.items,  // items stores the selected_title (Type1-1 format)
        allocated_budget: found.allocated_budget || prev.allocated_budget,
        bank: found.bank || prev.bank,
      }));
    }
  };

  // Compute this_month_balance and total_balance from monthlyDeposits
  // Set default withdrawal date = today's Jalali date
    useEffect(() => {
        if (!initialData) {
            const t = getTodayJalali();
            setForm(prev => ({
            ...prev,
            withdrawal_day: String(t.day),
            withdrawal_monthNumber: String(t.month),
            withdrawal_year: t.year,
            }));
        } else if (initialData.withdrawal_date) {
            const parts = initialData.withdrawal_date.split("-");
            if (parts.length === 3) {
            setForm(prev => ({
                ...prev,
                withdrawal_day: String(Number(parts[2])),
                withdrawal_monthNumber: String(Number(parts[1])),
                withdrawal_year: Number(parts[0]),
            }));
            }
        }
    }, [initialData]);

  // Compute total_out and remaining_balance
  useEffect(() => {
    const total_out = Number(form.amount_withdrawn) + Number(form.transfer_amount);
    const remaining = Number(form.total_balance) - total_out;
    setForm((prev) => ({ ...prev, total_out, remaining_balance: remaining }));
    setIsNegative(remaining < 0);
  }, [form.amount_withdrawn, form.transfer_amount, form.total_balance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: [
      "allocated_budget", "amount_withdrawn", "transfer_amount", "total_out", "this_month_balance", "total_balance", "remaining_balance"
    ].includes(name) ? Number(value) : value }));
  };

  // Auto-fill this_month_balance & total_balance from monthlyDeposits
   // Compute balances using both tables:
// monthlyDeposits (initial balance of month)
// withdrawals (remaining_balance of previous transactions)
    useEffect(() => {
        if (!form.type_name || !form.items || !form.withdrawal_monthNumber) return;

        const selectedMonth = Number(form.withdrawal_monthNumber);

        // 1) رکورد واریزی ماه جاری
        const depositRecord = monthlyDeposits.find((rec) => {
            const recMonth = Number(rec.deposit_date?.split("-")[1]);
            return (
                rec.type_name === form.type_name &&
                rec.items === form.items //&&
                //recMonth === selectedMonth
            );
        });

        // 2) پیدا کردن آخرین برداشت ثبت‌شده برای همین type و items
        const lastWithdrawal = withdrawals
            .filter(w =>
                w.type_name === form.type_name &&
                w.items === form.items
            )
            .sort((a, b) => new Date(b.withdrawal_date) - new Date(a.withdrawal_date))[0];

        let thisMonthBalance = 0;
        let totalBalance = 0;

        if (lastWithdrawal) {
            // اگر برداشت قبلی هست → موجودی واقعی از remaining_balance
            totalBalance = Number(lastWithdrawal.remaining_balance) || 0;
            thisMonthBalance = depositRecord ? Number(depositRecord.amount_deposited) : 0;
        } else {
            // اگر برداشت قبلی نیست → موجودی ماه از monthly_deposits
            totalBalance = depositRecord ? Number(depositRecord.balance_after) : 0;
            thisMonthBalance = depositRecord ? Number(depositRecord.amount_deposited) : 0;
        }

        setForm(prev => ({
            ...prev,
            this_month_balance: thisMonthBalance,
            total_balance: totalBalance,
        }));

    }, [form.type_name, form.items, form.withdrawal_monthNumber, monthlyDeposits, withdrawals]);


  // Persian date build
  const handleDateChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const withdrawal_date = (form.withdrawal_day && form.withdrawal_monthNumber && form.withdrawal_year) ?
//       `${form.withdrawal_year}-${String(form.withdrawal_monthNumber).padStart(2, '0')}-${String(form.withdrawal_day).padStart(2, '0')}` : null;
//     const payload = { ...form, withdrawal_date };
//     delete payload.withdrawal_day;
//     delete payload.withdrawal_monthNumber;
//     delete payload.withdrawal_year;
//     onSubmit(payload);
//   };

    const handleSubmit = async (e) => {
  e.preventDefault();

  const withdrawal_date =
    form.withdrawal_day && form.withdrawal_monthNumber && form.withdrawal_year
      ? `${form.withdrawal_year}-${String(form.withdrawal_monthNumber).padStart(2, "0")}-${String(form.withdrawal_day).padStart(2, "0")}`
      : null;

    const payload = { ...form, withdrawal_date };
    delete payload.withdrawal_day;
    delete payload.withdrawal_monthNumber;
    delete payload.withdrawal_year;

    await onSubmit(payload);   // ثبت موفق
    resetForm();               // ✅ ریست فرم
    };


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
      <TextField select label="نوع" name="type_name" value={form.type_name || ""} onChange={handleChange} sx={{ minWidth: 200 }}>
        <MenuItem value=""><em>انتخاب نوع</em></MenuItem>
        {TYPES.map((t) => (
          <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
        ))}
      </TextField>
      <TextField select label="عنوان" name="selected_title" value={selectedTitle} onChange={handleTitleSelect} required sx={{ minWidth: 200 }}>
        <MenuItem value=""><em>انتخاب عنوان</em></MenuItem>
        {typeItems.map((item) => {
          const dn = form.type_name ? form.type_name.charAt(0).toUpperCase() + form.type_name.slice(1) : "";
          const label = `${dn}-${item.id}`;
          return <MenuItem key={item.id} value={label}>{label}</MenuItem>;
        })}
      </TextField>
      <TextField label="موضوع" name="topic" value={form.topic || ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, backgroundColor: "#f5f5ff" }} />
      <TextField label="موارد" name="items" value={form.items || ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, backgroundColor: "#f5f5ff" }} />
      <TextField label="بودجه اختصاص یافته" name="allocated_budget" value={form.allocated_budget ? form.allocated_budget.toLocaleString() : ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, color: "darkgreen", fontWeight: "bold", backgroundColor: "#f0fff5" }} />
      <TextField label="بانک اختصاص یافته" name="bank" value={form.bank || ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, backgroundColor: "#fffaf0" }} />
      <TextField label="مبلغ برداشت شده" name="amount_withdrawn" type="number" value={form.amount_withdrawn} onChange={handleChange} />
      <TextField label="مبلغ انتقالی" name="transfer_amount" type="number" value={form.transfer_amount} onChange={handleChange} />
      <TextField label="مجموع انتقالی و برداشت" name="total_out" value={form.total_out ? form.total_out.toLocaleString() : ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, fontWeight: "bold", backgroundColor: "#f5f5f5" }} />
      <TextField select label="بانکی که مبلغ به آن انتقال یافته" name="transfer_bank" value={form.transfer_bank || ""} onChange={handleChange} sx={{ minWidth: 200 }}>
        <MenuItem value=""><em>انتخاب بانک</em></MenuItem>
        {banks.map((b) => <MenuItem key={b.id} value={b.bank_name}>{b.bank_name}</MenuItem>)}
      </TextField>
      
      
      <TextField label="توضيحات برداشت" name="description" value={form.description} onChange={handleChange} sx={{ minWidth: 300 }} />
      
      {/* کارت تاریخ برداشت */}
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 620 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'left', pr: 1 }}>تاریخ برداشت</Typography>
          <TextField select label="روز" name="withdrawal_day" value={form.withdrawal_day || ""} onChange={e => handleDateChange("withdrawal_day", e.target.value)} sx={{ minWidth: 100 }}>
            <MenuItem value=""><em>روز</em></MenuItem>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <MenuItem key={d} value={String(d)}>{d}</MenuItem>
            ))}
          </TextField>
          <TextField select label="ماه" name="withdrawal_monthNumber" value={form.withdrawal_monthNumber || ""} onChange={e => handleDateChange("withdrawal_monthNumber", e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value=""><em>ماه</em></MenuItem>
            {PERSIAN_MONTHS.map((m) => (
              <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="سال" name="withdrawal_year" type="number" value={form.withdrawal_year || getCurrentPersianYear()} onChange={e => handleDateChange("withdrawal_year", e.target.value)} sx={{ minWidth: 140 }} />
        </CardContent>
      </Card>

      
      
          <TextField label="موجودی این ماه" value={form.this_month_balance === 0 ? 0 : (form.this_month_balance ? form.this_month_balance.toLocaleString() : "")} InputProps={{ readOnly: true }} sx={{ minWidth: 200, backgroundColor: "#f0fff5", fontWeight: "bold" }} />
      <TextField label="موجودی کل" value={form.total_balance === 0 ? 0 : (form.total_balance ? form.total_balance.toLocaleString() : "")} InputProps={{ readOnly: true }} sx={{ minWidth: 200, backgroundColor: "#f0fff5", fontWeight: "bold" }} />
      <TextField label="مبلغ مانده در حساب" value={form.remaining_balance === 0 ? 0 : (form.remaining_balance ? form.remaining_balance.toLocaleString() : "")} InputProps={{ readOnly: true }} sx={{ minWidth: 200, fontWeight: "bold", color: isNegative ? "error.main" : "darkgreen", backgroundColor: isNegative ? "#fff0f0" : "#f0fff5" }} />
      
      <Button type="submit" variant="contained" color="primary">{initialData ? "ویرایش" : "افزودن"}</Button>

      
    </Box>
  );
};

export default MonthlyWithdrawalForm;
