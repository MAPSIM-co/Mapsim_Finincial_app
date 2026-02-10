// src/pages/DebtorCreditor.js

import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, IconButton,
  FormControlLabel, Checkbox
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api/api";
import jalaali from "jalaali-js";

/* ================= Constants ================= */
const TYPES = ["type1", "type2", "type3", "type4", "type5"];
const TRANSACTION_TYPES = ["تسویه با صندوق", "قرض از صندوق"];
const displayName = (type) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "");
const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 }, { name: "اردیبهشت", number: 2 }, { name: "خرداد", number: 3 },
  { name: "تیر", number: 4 }, { name: "مرداد", number: 5 }, { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 }, { name: "آبان", number: 8 }, { name: "آذر", number: 9 },
  { name: "دی", number: 10 }, { name: "بهمن", number: 11 }, { name: "اسفند", number: 12 }
];
/* ================= Helpers ================== */
const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { year: j.jy, month: j.jm, day: j.jd };
};

/* ================= Component ================= */
export default function DebtorCreditor() {

  /* ------------- States ------------- */
  const [rows, setRows] = useState([]);
  const [banks, setBanks] = useState([]);
  const [persons, setPersons] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [typeItems, setTypeItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const [borrowDate, setBorrowDate] = useState(getTodayJalali());
  const [returnDate, setReturnDate] = useState(getTodayJalali());
    const [transactionType, setTransactionType] = useState("");
  const [form, setForm] = useState({
    person_id: "",
    type_name: "",
    items: "",
    topic: "",
    allocated_budget: "",
    bank: "",
    amount: "",
    is_active: false,
    description: "",
    saved_amount: 0,
  });

  const resetForm = () => {
  setForm({
    person_id: "",
    type_name: "",
    items: "",
    topic: "",
    allocated_budget: "",
    bank: "",
    amount: "",
    is_active: false,
    description: "",
    saved_amount: 0,
  });
  setSelectedItem("");
  setTransactionType("");
};

  /* ================= Load Data ================= */
  const loadData = () => {
    api.get("/debtor_creditor/").then(res => setRows(res.data));
  };

  const loadPersons = () => {
    api.get("/persons/").then(res => setPersons(res.data));
  };

  useEffect(() => {
    loadData();
    loadPersons();
  }, []);

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

  /* ================= Handlers ================= */

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  // Checkbox toggle
  const handleCheckbox = (e) => {
    setForm(p => ({ ...p, is_active: e.target.checked }));
  };

  // Open new form
  const openNewForm = () => {
    setEditRow(null);
    setForm({
      person_id: "",
      type_name: "",
      items: "",
      topic: "",
      allocated_budget: "",
      bank: "",
      amount: "",
      is_active: false,
      description: "",
      saved_amount: 0,
    });
    setSelectedItem("");
    setBorrowDate(getTodayJalali());
    setReturnDate(getTodayJalali());
    setOpenForm(true);
  };

  // Open edit form
  const openEditForm = (row) => {
    setEditRow(row);
    setForm({ ...row });
    setSelectedItem(row.items || "");
    setOpenForm(true);
  };

  // Delete row
  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    await api.delete(`/debtor_creditor/${id}`);
    loadData();
  };

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

  /* ---------------- Submit Form ---------------- */
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        borrow_date: `${borrowDate.year}-${String(borrowDate.month).padStart(2,"0")}-${String(borrowDate.day).padStart(2,"0")}`,
        return_date: form.is_active
          ? `${returnDate.year}-${String(returnDate.month).padStart(2,"0")}-${String(returnDate.day).padStart(2,"0")}`
          : null
      };

      if (editRow) {
        await api.put(`/debtor_creditor/${editRow.id}`, payload);
      } else {
        await api.post("/debtor_creditor/", payload);
      }

      setOpenForm(false);
      loadData();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      {/* -------- Button -------- */}
      <Button variant="contained" sx={{ mb: 2 }} onClick={openNewForm}>
        ثبت بدهکار / بستانکار
      </Button>

      {/* -------- Table -------- */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">شخص</TableCell>
              <TableCell align="center">نوع</TableCell>
              <TableCell align="center">آیتم</TableCell>
              <TableCell align="center">بانک / صندوق</TableCell>
              <TableCell align="center">مبلغ</TableCell>
              <TableCell align="center">تاریخ دریافت</TableCell>
              <TableCell align="center">تاریخ برگشت</TableCell>
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell align="center">{row.person?.full_name || "-"}</TableCell>
                <TableCell align="center">{row.type_name}</TableCell>
                <TableCell align="center">{row.items}</TableCell>
                <TableCell align="center">{row.bank}</TableCell>
                <TableCell align="center">{Number(row.amount).toLocaleString()}</TableCell>
                <TableCell align="center">{row.borrow_date || "-"}</TableCell>
                <TableCell align="center">{row.return_date || "-"}</TableCell>
                <TableCell align="center">{row.is_active ? "تسویه شده ✅" : "باز ❌"}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => openEditForm(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* -------- Modal Form -------- */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editRow ? "ویرایش بدهی / طلب" : "ثبت بدهی / طلب جدید"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>

            {/* -------- Person -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="شخص"
                name="person_id"
                value={form.person_id}
                onChange={handleChange}
                fullWidth
              >
                {persons.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* -------- Type -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="نوع"
                name="type_name"
                value={form.type_name}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">
                    <em>انتخاب نوع</em>
                    </MenuItem>
                    {TYPES.map(t => <MenuItem key={t} value={t}>{displayName(t)}</MenuItem>)}
                </TextField>
            </Grid>

            {/* -------- Item / Title -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="عنوان"
                value={selectedItem}
                onChange={handleItemSelect}
                fullWidth
              >
                {/* <MenuItem value=""><em>انتخاب عنوان</em></MenuItem>
                {form.type_name === "Type4" && (
                  <MenuItem value="Type4-1">Type4-1</MenuItem>
                )} */}

                {/* نمایش همه زیر مجوعه Type ها مانند Type1-1 , Type4-2 و ... */}
              {typeItems.map(item => {
                const label = `${displayName(form.type_name)}-${item.id}`;
                return <MenuItem key={item.id} value={label}>{label}</MenuItem>;
              })}
              </TextField>
            </Grid>

            {/* -------- Topic (ReadOnly) -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="موضوع"
                value={form.topic || ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* -------- Allocated Budget (ReadOnly) -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="بودجه اختصاص یافته"
                value={form.allocated_budget ? Number(form.allocated_budget).toLocaleString() : ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* -------- Bank (ReadOnly) -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="بانک / صندوق"
                value={form.bank || "-"}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* -------- Amount -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="مبلغ"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* -------- Borrow Date (Jalali) -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="روز دریافت"
                type="number"
                value={borrowDate.day}
                onChange={e => setBorrowDate(p => ({ ...p, day: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="ماه دریافت"
                type="number"
                value={borrowDate.month}
                onChange={e => setBorrowDate(p => ({ ...p, month: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="سال دریافت"
                type="number"
                value={borrowDate.year}
                onChange={e => setBorrowDate(p => ({ ...p, year: e.target.value }))}
                fullWidth
              />
            </Grid>

            {/* -------- Active / Settled -------- */}
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
            {/* <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={form.is_active} onChange={handleCheckbox} />}
                label={form.is_active ? "تسویه شده" : "تسویه نشده"}
              />
            </Grid> */}

            {/* -------- Description -------- */}
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

            {/* -------- Saved Amount / Balance -------- */}
            <Grid item xs={12} md={4}>
              <TextField
                label="مانده صندوق"
                value={form.saved_amount ? Number(form.saved_amount).toLocaleString() : ""}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

          </Grid>
        </DialogContent>

        {/* -------- Actions -------- */}
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit}>ذخیره</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
