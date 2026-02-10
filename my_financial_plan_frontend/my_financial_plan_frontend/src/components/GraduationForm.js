// src/pages/GraduationForm.js

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography
} from "@mui/material";
import { api } from "../api/api";
import jalaali from "jalaali-js";

/* -------------------- helpers -------------------- */
const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { year: j.jy, month: j.jm, day: j.jd };
};

const displayName = (type) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "");

const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 }, { name: "اردیبهشت", number: 2 }, { name: "خرداد", number: 3 },
  { name: "تیر", number: 4 }, { name: "مرداد", number: 5 }, { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 }, { name: "آبان", number: 8 }, { name: "آذر", number: 9 },
  { name: "دی", number: 10 }, { name: "بهمن", number: 11 }, { name: "اسفند", number: 12 }
];

const TRANSACTION_TYPES = ["تراکنش واریز به حساب", "تراکنش برداشت از حساب"];
const TYPES = [ "type4"];

const transactionTypeMap = {
  "واریز": "deposit",
  "برداشت": "withdraw",
  "تراکنش واریز به حساب": "deposit",
  "تراکنش برداشت از حساب": "withdraw"
};


/* -------------------- component -------------------- */
export default function GraduationForm({ open, onClose, onSaved, editData }) {
  const [banks, setBanks] = useState([]);
  const [typeItems, setTypeItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("Type4-1");
  const [transactionType, setTransactionType] = useState("");
  const [dateParts, setDateParts] = useState(getTodayJalali());

  const [form, setForm] = useState({
    type_name: "",
    items: "",
    topic: "",
    allocated_budget: 0,
    bank: "",
    amount: "",
    withdrawn_amount: "",
    saved_amount: 0,
    description: ""
  });

  const resetForm = () => {
  setForm({
    type_name: "",
    items: "",
    topic: "",
    allocated_budget: 0,
    bank: "",
    amount: "",
    withdrawn_amount: "",
    saved_amount: 0,
    balance_before: 0,
    description: ""
  });
  setSelectedItem("");
  setTransactionType("");
};

  const [isShortfall, setIsShortfall] = useState(false);
  const [deltaIsZero, setDeltaIsZero] = useState(false);


  
  /* ---------- load banks ---------- */
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/accounts/");
        setBanks(res.data);
      } catch (error) {
        console.error("خطا در دریافت بانک‌ها:", error);
      }
    };
    fetchBanks();
  }, []);

  /* ---------- edit mode ---------- */
  useEffect(() => {
  if (!editData ) return;

  const bankName = editData.bank_id
    ? banks.find(b => b.id === editData.bank_id)?.bank_name || ""
    : "";

  

  setForm(prev => ({
    type_name: editData.type_name || "",
    items: editData.items || "",
    topic: editData.topic || "",
    allocated_budget: editData.allocated_budget || 0,
    bank: editData.bank?.bank_name || "",
    amount: editData.amount ?? "",
    withdrawn_amount: editData.withdrawn_amount ?? "",
    saved_amount: editData.saved_amount ?? 0,
    balance_before: editData.saved_amount ?? 0,
    description: editData.description ?? "",
  }));

  setSelectedItem(editData.items || "");
  setTransactionType(
    editData.transaction_type === "deposit" ? "تراکنش واریز به حساب" : "تراکنش برداشت از حساب"
  );
}, [editData]);


  /* ---------- load items when type changes ---------- */
  useEffect(() => {
    if (!form.type_name) {
      setTypeItems([]);
      setSelectedItem("");
      return;
    }

    const fetchTypeItems = async () => {
      try {
        
        const res = await api.get(`/${form.type_name}/`);
        console.log("در حال دریافت آیتم‌ها برای نوع:", form.type_name);
        setTypeItems(res.data || []);
      } catch (err) {
        console.error("خطا در دریافت آیتم‌ها:", err);
        setTypeItems([]);
      }
    };

    fetchTypeItems();
    setSelectedItem("");
  }, [form.type_name]);

  
  /* ---------- handle title selection ---------- */
const handleItemSelect = async (e) => {
  const val = e.target.value;
  setSelectedItem(val);

  let id = val;
  if (typeof val === 'string' && val.includes('-')) {
    id = val.split('-').pop();
  }
  const found = typeItems.find((it) => String(it.id) === String(id));
  if (found) {
    setForm(prev => ({
      ...prev,
      items: val,
      topic: found.topic || "",
      allocated_budget: found.allocated_budget || 0,
      bank: found.bank || prev.bank,
    }));
  }

  // --- fetch last saved amount after selecting item ---
  try {
    const res = await api.get("/Graduation/last-balance");
    setForm(prev => ({
      ...prev,
      balance_before: res.data.saved_amount,
      saved_amount: res.data.saved_amount
    }));
  } catch (err) {
    console.error(err);
    setForm(prev => ({
      ...prev,
      balance_before: 0,
      saved_amount: 0
    }));
  }
};

  /* ---------- handle transaction type ---------- */
  useEffect(() => {
    if (!transactionType) return;

    if (transactionType === "تراکنش واریز به حساب") {
      setForm(prev => ({ ...prev, withdrawn_amount: "" }));
    }
    if (transactionType === "تراکنش برداشت از حساب") {
      setForm(prev => ({ ...prev, amount: "" }));
    }
  }, [transactionType]);

  /* ---------- handle amounts and saved_amount ---------- */
  useEffect(() => {
  const amount = Number(form.amount) || 0;
  const withdrawn = Number(form.withdrawn_amount) || 0;
  const balanceBefore = Number(form.balance_before || 0);

  let saved;
  if (transactionType === "تراکنش واریز به حساب") {
    saved = balanceBefore + amount;
  } else if (transactionType === "تراکنش برداشت از حساب") {
    saved = balanceBefore - withdrawn;
  } else {
    saved = balanceBefore; // حالت اولیه
  }

  setForm(prev => ({ ...prev, saved_amount: saved }));
}, [form.amount, form.withdrawn_amount, transactionType, form.balance_before]);

  

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setDateParts(prev => ({ ...prev, [field]: value }));
  };

  /* ---------- handle submit ---------- */
  const handleSubmit = async () => {
  try {
    // محاسبه مقادیر قبل/بعد
    const balanceBefore = Number(form.balance_before || 0);
    const balanceAfter = Number(form.saved_amount || balanceBefore);


    const payload = {
        type_name: form.type_name,       // مثلا "type4"
        item_id: form.item_id ?? 1,           // نباید undefined باشد
        items: form.items,               // مثلا "Type4-1"
        topic: form.topic,
        allocated_budget: form.allocated_budget 
        ? Number(String(form.allocated_budget).replace(/,/g, "")) 
        : 0,

        bank: form.bank,
        amount: Number(form.amount) ?? 0,
        withdrawn_amount: Number(form.withdrawn_amount) ?? 0,
        saved_amount: balanceAfter ?? 0,
        description: form.description || "",
        transaction_type: transactionType ? transactionTypeMap[transactionType] : "withdraw",
        balance_before: balanceBefore ?? 0,
        balance_after: balanceAfter ?? 0,
        transaction_date: `${dateParts.year}-${String(dateParts.month).padStart(2,"0")}-${String(dateParts.day).padStart(2,"0")}` // جلالی
};

    console.log("🚀 Payload to API:", payload);

    if (editData) {
      await api.put(`/Graduation/${editData.id}`, payload);
    } else {
      await api.post("/Graduation", payload);
    }

    onSaved && onSaved(payload);
    onClose();
    // پاک کردن فرم بعد از ذخیره
    resetForm();

  } catch (err) {
    console.error("خطا در ذخیره:", err);
  }
};



  /* -------------------- UI -------------------- */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? "ویرایش تراکنش شهریه" : "ثبت تراکنش جدید شهریه"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* نوع */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="نوع"
              name="type_name"
              value={form.type_name || ""}
              onChange={handleChange}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="">
                <em>انتخاب نوع</em>
              </MenuItem>
              {TYPES.map(t => <MenuItem key={t} value={t}>{displayName(t)}</MenuItem>)}
            </TextField>
          </Grid>

          {/* عنوان */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="عنوان"
              name="selected_title"
              value={selectedItem}
              onChange={handleItemSelect}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="">
                <em>انتخاب عنوان</em>
              </MenuItem>

                {/* فقط نمایش یک Type خاص مثلا فقط نمایش Type4-1 به کاربر */}
                
                {form.type_name === "type4" && (
                    <MenuItem value="Type4-1">Type4-1</MenuItem>
                )}

            {/* نمایش همه زیر مجوعه Type ها مانند Type1-1 , Type4-2 و ... */}
              {/* {typeItems.map(item => {
                const label = `${displayName(form.type_name)}-${item.id}`;
                return <MenuItem key={item.id} value={label}>{label}</MenuItem>;
              })} */}

              {/* فقط یک مقدار ثابت نمایش داده می‌شود */}
             {/* <MenuItem value="Type4-1">Type4-1</MenuItem> */}

            </TextField>
          </Grid>

          {/* موضوع */}
          <Grid item xs={12} md={4}>
            <TextField
              label="موضوع"
              value={form.topic || ""}
              InputProps={{ readOnly: true }}
              fullWidth size="medium"
            />
          </Grid>

          {/* بودجه اختصاص یافته */}
          <Grid item xs={12} md={4}>
            <TextField
              label="بودجه اختصاص یافته"
              value={form.allocated_budget ? form.allocated_budget.toLocaleString() : ""}
              InputProps={{ readOnly: true }}
              fullWidth size="medium"
            />
          </Grid>

          {/* بانک اختصاص یافته */}
          <Grid item xs={12} md={4}>
            <TextField
              label="بانک اختصاص یافته"
              value={form.bank || "-"}
              InputProps={{ readOnly: true }}
              fullWidth size="medium"
            />
          </Grid>

          {/* نوع تراکنش */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="نوع تراکنش"
              value={transactionType}
              onChange={e => setTransactionType(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value=""><em>انتخاب</em></MenuItem>
              {TRANSACTION_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>

          {/* مبلغ واریز یا برداشت */}
          {transactionType === TRANSACTION_TYPES[0] && (
            <Grid item xs={12} md={4}>
              <TextField
                label="مبلغ واریز"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                fullWidth size="medium"
              />
            </Grid>
          )}

          {transactionType === TRANSACTION_TYPES[1] && (
            <Grid item xs={12} md={4}>
              <TextField
                label="مبلغ برداشت"
                name="withdrawn_amount"
                value={form.withdrawn_amount}
                onChange={handleChange}
                fullWidth size="medium"
              />
            </Grid>
          )}

          {/* تاریخ تراکنش */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">تاریخ تراکنش</Typography>
            <TextField
              select
              label="روز"
              value={dateParts.day}
              onChange={e => handleDateChange("day", e.target.value)}
              sx={{ minWidth: 80 }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              label="ماه"
              value={dateParts.month}
              onChange={e => handleDateChange("month", e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {PERSIAN_MONTHS.map(m => (
                <MenuItem key={m.number} value={m.number}>{m.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="سال"
              type="number"
              value={dateParts.year}
              onChange={e => handleDateChange("year", e.target.value)}
              sx={{ minWidth: 80 }}
            />
          </Grid>

          {/* مانده صندوق */}
          <Grid item xs={12} md={4}>
            <TextField
              label="مانده صندوق"
              value={form.saved_amount ? form.saved_amount.toLocaleString() : ""}
              InputProps={{ readOnly: true }}
              fullWidth size="medium"
            />
          </Grid>

          {/* توضیحات */}
          <Grid item xs={12}>
            <TextField
              label="توضیحات"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>

          
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit}>ذخیره</Button>
      </DialogActions>
    </Dialog>
  );
}
