import React, { useState, useEffect } from "react";
import { TextField, Button, Box, MenuItem, Card, CardContent, Typography } from "@mui/material";
import jalaali from "jalaali-js";
import { api } from "../api/api";

const MonthlyDepositForm = ({
  onSubmit,
  initialData,
  monthlyDeposits = [],
  monthlyWithdrawals = []
}) => {

  const [form, setForm] = useState({
    type_name: "",
    topic: "",
    items: "",
    allocated_budget: 0,
    bank: "",
    amount_deposited: 0,
    extra_payment: 0,
    shortfall: 0,
    deposit_date: "",
    deposit_day: "",
    deposit_monthNumber: "",
    deposit_year: "",
    description: "",
    balance_before: 0,
    balance_after: 0,
  });

  const [banks, setBanks] = useState([]);
  const [availableTypes] = useState(["type1", "type2", "type3", "type4", "type5"]);
  const [typeItems, setTypeItems] = useState([]); // items for selected type
  const [selectedTitle, setSelectedTitle] = useState("");
  const [isShortfall, setIsShortfall] = useState(false);
  const [deltaIsZero, setDeltaIsZero] = useState(false);
  const TYPES = ["type1", "type2", "type3", "type4", "type5"];

  const formatItemCode = (type, id) => {
    if (!type) return "";
    return `${type.charAt(0).toUpperCase() + type.slice(1)}-${id}`;
    };


  const displayName = (type) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "");

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

  useEffect(() => {
    if (initialData) {
      // initialize form and, if type_name present, load items
      setForm((prev) => ({ ...prev, ...initialData }));
      if (initialData.type_name) {
        fetchTypeItems(initialData.type_name, initialData.id);
      }
    }
  }, [initialData]);

  // when user selects a type (type1..type5), fetch its items
  useEffect(() => {
    const t = form.type_name;
    if (!t) {
      setTypeItems([]);
      setSelectedTitle("");
      return;
    }

    const fetchTypeItems = async () => {
      try {
        const res = await api.get(`/${t}/`);
        setTypeItems(res.data || []);
      } catch (err) {
        console.error("خطا در بارگذاری آیتم‌های Type:", err);
        setTypeItems([]);
      }
    };

    fetchTypeItems();
    setSelectedTitle("");
  }, [form.type_name]);

  const fetchTypeItems = async (typeName, selectId = null) => {
    try {
      const res = await api.get(`/${typeName}/`);
      setTypeItems(res.data || []);
      if (selectId) {
        // if editing and we passed an id (monthly_deposit id is different), try to match by topic or other
      }
    } catch (error) {
      console.error("خطا در دریافت آیتم‌های Type:", error);
      setTypeItems([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // if changing type_name, clear title/topic/budget/bank so they will be loaded
    if (name === "type_name") {
      setForm((prev) => ({ ...prev, [name]: value, topic: "", allocated_budget: 0, bank: "" }));
      return;
    }
    // if changing amount_deposited we need to recompute extra/shortfall and balance_after
    if (name === "amount_deposited") {
      const amt = Number(value) || 0;
      const alloc = Number(form.allocated_budget) || 0;
      // desired formula: delta = amount_deposited - allocated_budget
      // if delta < 0 => کسری (shortfall)
      // if delta > 0 => اضافه پرداخت
      // if delta == 0 => no display
      const delta = amt - alloc;
      // also compute balance_after = balance_before + amount_deposited
      const newBalanceAfter = (Number(form.balance_before) || 0) + amt;
      if (delta < 0) {
        setForm((prev) => ({ ...prev, amount_deposited: amt, extra_payment: 0, shortfall: Math.abs(delta), balance_after: newBalanceAfter }));
        setIsShortfall(true);
        setDeltaIsZero(false);
      } else if (delta > 0) {
        setForm((prev) => ({ ...prev, amount_deposited: amt, extra_payment: delta, shortfall: 0, balance_after: newBalanceAfter }));
        setIsShortfall(false);
        setDeltaIsZero(false);
      } else {
        // delta === 0
        setForm((prev) => ({ ...prev, amount_deposited: amt, extra_payment: 0, shortfall: 0, balance_after: newBalanceAfter }));
        setDeltaIsZero(true);
      }
      return;
    }

    // if changing balance_before, also recompute balance_after
    if (name === "balance_before") {
      const before = Number(value) || 0;
      const deposited = Number(form.amount_deposited) || 0;
      const newBalanceAfter = before + deposited;
      setForm((prev) => ({
        ...prev,
        [name]: before,
        balance_after: newBalanceAfter,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: [
        "allocated_budget",
        "amount_deposited",
        "extra_payment",
        "shortfall",
        "balance_before",
        "balance_after",
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleTitleSelect = (e) => {
    const val = e.target.value; // expected format like 'Type1-3' or just id
    setSelectedTitle(val);

    // try to extract id
    let id = val;
    if (typeof val === 'string' && val.includes('-')) {
      id = val.split('-').pop();
    }

    const found = typeItems.find((it) => String(it.id) === String(id));
    if (found) {
      setForm((prev) => ({
        ...prev,
        topic: found.topic || prev.topic,
        items: val || prev.items,  // items stores the selected_title (Type1-1 format)
        allocated_budget: found.allocated_budget || prev.allocated_budget,
        bank: found.bank || prev.bank,
      }));
      // recompute extra/shortfall if amount already entered
      const amt = Number(form.amount_deposited) || 0;
      const alloc = Number(found.allocated_budget) || 0;
      // use same desired formula: delta = amount_deposited - allocated_budget
      const delta = amt - alloc;
      if (delta < 0) {
        setForm((p) => ({ ...p, extra_payment: 0, shortfall: Math.abs(delta) }));
        setIsShortfall(true);
        setDeltaIsZero(false);
      } else if (delta > 0) {
        setForm((p) => ({ ...p, extra_payment: delta, shortfall: 0 }));
        setIsShortfall(false);
        setDeltaIsZero(false);
      } else {
        // delta === 0
        setForm((p) => ({ ...p, extra_payment: 0, shortfall: 0 }));
        setDeltaIsZero(true);
      }
    }
  };


  useEffect(() => {
  // اگر نوع یا عنوان انتخاب نشده‌اند کاری نکن
  if (!form.type_name || !selectedTitle) return;

  // 1) استخراج id واقعی از selectedTitle
  let itemId = selectedTitle;
  if (typeof selectedTitle === "string" && selectedTitle.includes("-")) {
    itemId = selectedTitle.split("-").pop();
  }

  // 2) جستجوی آخرین withdrawal مربوط به همین type_name و items
  // توجه: ممکنه در monthlyWithdrawals ستون items فقط عدد ذخیره شده باشد
  const lastWithdrawal = [...monthlyWithdrawals]
    .filter(w => {
      // normalize both sides to strings to be safe
      return String(w.type_name) === String(form.type_name) &&
             (String(w.items) === String(itemId) || String(w.items) === String(selectedTitle));
    })
    .sort((a, b) => {
      // مرتب‌سازی بر اساس تاریخ اگر موجود باشد؛ در غیر اینصورت براساس id نزولی
      const dateA = a.withdrawal_date ? new Date(a.withdrawal_date) : null;
      const dateB = b.withdrawal_date ? new Date(b.withdrawal_date) : null;
      if (dateA && dateB) return dateB - dateA;
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return (b.id || 0) - (a.id || 0);
    })[0];

  if (lastWithdrawal) {
    const lastBal = Number(lastWithdrawal.remaining_balance || 0);

    setForm(prev => ({
        ...prev,
        items: formatItemCode(form.type_name, itemId),
        balance_before: lastBal,
        balance_after: lastBal + (Number(prev.amount_deposited) || 0)
    }));

    return;
    }


  // 3) fallback: اگر برداشتی نبود، از monthlyDeposits آخرین balance_after مربوط استفاده کن
  const depositCandidate = [...monthlyDeposits]
    .filter(d => String(d.type_name) === String(form.type_name) &&
                 (String(d.items) === String(itemId) || String(d.items) === String(selectedTitle)))
    .sort((a,b) => {
      const dateA = a.deposit_date ? new Date(a.deposit_date) : null;
      const dateB = b.deposit_date ? new Date(b.deposit_date) : null;
      if (dateA && dateB) return dateB - dateA;
      return (b.id || 0) - (a.id || 0);
    })[0];

  const fallbackBalance = Number(depositCandidate?.balance_after || 0);
  setForm(prev => ({
    ...prev,
    items: formatItemCode(form.type_name, itemId),
    balance_before: fallbackBalance,
    balance_after: fallbackBalance + (Number(prev.amount_deposited) || 0)
  }));

}, [form.type_name, selectedTitle, monthlyWithdrawals, monthlyDeposits]);




  // Persian months for combo-box

  const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { day: j.jd, month: j.jm, year: j.jy };
  };

  const PERSIAN_MONTHS = [
    { name: "فروردین", number: 1 },{ name: "اردیبهشت", number: 2 },{ name: "خرداد", number: 3 },{ name: "تیر", number: 4 },{ name: "مرداد", number: 5 },{ name: "شهریور", number: 6 },{ name: "مهر", number: 7 },{ name: "آبان", number: 8 },{ name: "آذر", number: 9 },{ name: "دی", number: 10 },{ name: "بهمن", number: 11 },{ name: "اسفند", number: 12 }
  ];

  const getCurrentPersianYear = () => {
    const today = new Date();
    let year = today.getFullYear() - 621;
    const month = today.getMonth() + 1;
    const day = today.getDate();
    if (month < 3 || (month === 3 && day < 20)) year -= 1;
    return year;
  };

  // replace single deposit_date with day/month/year parts
  useEffect(() => {
        if (initialData && initialData.deposit_date) {
            const parts = initialData.deposit_date.split("-");
            if (parts.length === 3) {
            setForm((p) => ({
                ...p,
                deposit_day: String(Number(parts[2])),
                deposit_monthNumber: String(Number(parts[1])),
                deposit_year: Number(parts[0]),
            }));
            }
        } else {
            const t = getTodayJalali();
            setForm((p) => ({
            ...p,
            deposit_day: String(t.day),
            deposit_monthNumber: String(t.month),
            deposit_year: t.year,
            }));
        }
    }, [initialData]);


  const handleSubmit = (e) => {
    e.preventDefault();

    // build deposit_date string if parts present
    const deposit_date = (form.deposit_day && form.deposit_monthNumber && form.deposit_year) ?
      `${form.deposit_year}-${String(form.deposit_monthNumber).padStart(2, '0')}-${String(form.deposit_day).padStart(2, '0')}` : null;

    const payload = { ...form, deposit_date };
    // remove the split fields from payload
    delete payload.deposit_day;
    delete payload.deposit_monthNumber;
    delete payload.deposit_year;

    onSubmit(payload);

    setForm({
      type_name: "",
      topic: "",
      items: "",
      allocated_budget: 0,
      bank: "",
      amount_deposited: 0,
      extra_payment: 0,
      shortfall: 0,
      deposit_date: "",
      description: "",
      balance_before: 0,
      balance_after: 0,
      deposit_day: "",
      deposit_monthNumber: "",
      deposit_year: getCurrentPersianYear()
    });
    setIsShortfall(false);
    setDeltaIsZero(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
      <TextField
        select
        label="نوع"
        name="type_name"
        value={form.type_name || ""}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">
          <em>انتخاب نوع</em>
        </MenuItem>
        {TYPES.map((t) => (
          <MenuItem key={t} value={t}>{displayName(t)}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="عنوان"
        name="selected_title"
        value={selectedTitle}
        onChange={handleTitleSelect}
        required
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">
          <em>انتخاب عنوان</em>
        </MenuItem>
        {typeItems.map((item) => {
          const dn = form.type_name ? form.type_name.charAt(0).toUpperCase() + form.type_name.slice(1) : "";
          const label = `${dn}-${item.id}`;
          return (
            <MenuItem key={item.id} value={label}>
              {label}
            </MenuItem>
          );
        })}
      </TextField>

      <TextField
        label="موضوع"
        name="topic"
        value={form.topic || ""}
        InputProps={{ readOnly: true }}
        sx={{ minWidth: 200, backgroundColor: "#f5f5ff" }}
      />

      <TextField
        label="بودجه اختصاص یافته"
        name="allocated_budget"
        value={form.allocated_budget ? form.allocated_budget.toLocaleString() : ""}
        InputProps={{ readOnly: true }}
        sx={{ minWidth: 200, color: "darkgreen", fontWeight: "bold", backgroundColor: "#f0fff5" }}
      />

      <TextField
        label="بانک"
        name="bank"
        value={form.bank || ""}
        InputProps={{ readOnly: true }}
        sx={{ minWidth: 200, backgroundColor: "#fffaf0" }}
      />

      <TextField label="مبلغ واریز شده" name="amount_deposited" type="number" value={form.amount_deposited} onChange={handleChange} />

      {!deltaIsZero && (
        <TextField label={isShortfall ? "کسری پرداخت" : "اضافه پرداخت"}
          value={(isShortfall ? form.shortfall : form.extra_payment) ? (isShortfall ? form.shortfall : form.extra_payment).toLocaleString() : ""}
          InputProps={{ readOnly: true }}
          sx={{ minWidth: 200, color: isShortfall ? "error.main" : "darkgreen", backgroundColor: isShortfall ? "#fff0f0" : "#f0fff5", fontWeight: "bold" }}
        />
      )}

        {/* کارت تاریخ واریز: فقط کمبوهای روز/ماه/سال (حذف ورودی متنی تکراری) */}
        <Card variant="outlined" sx={{ width: '100%', maxWidth: 620 }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ width: '100%', textAlign: 'right', pr: 1 }}>تاریخ واریز</Typography>

            <TextField
              select
              label="روز"
              name="deposit_day"
              value={form.deposit_day || ""}
              onChange={handleChange}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="">
                <em>روز</em>
              </MenuItem>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <MenuItem key={d} value={String(d)}>{d}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="ماه"
              name="deposit_monthNumber"
              value={form.deposit_monthNumber || ""}
              onChange={handleChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">
                <em>ماه</em>
              </MenuItem>
              {PERSIAN_MONTHS.map((m) => (
                <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
              ))}
            </TextField>

            <TextField label="سال" name="deposit_year" type="number" value={form.deposit_year || getCurrentPersianYear()} onChange={handleChange} sx={{ minWidth: 140 }} />
          </CardContent>
        </Card>

        <TextField label="توضیحات" name="description" value={form.description} onChange={handleChange} sx={{ minWidth: 200 }} />

      <TextField label="موجودی قبل از واریز" name="balance_before" type="number" value={form.balance_before} onChange={handleChange} />
      <TextField label="موجودی بعد از واریز" value={form.balance_after ? form.balance_after.toLocaleString() : ""} InputProps={{ readOnly: true }} sx={{ minWidth: 200, color: "darkgreen", fontWeight: "bold", backgroundColor: "#f0fff5" }} />

      <Button type="submit" variant="contained" color="primary">
        {initialData ? "ویرایش" : "افزودن"}
      </Button>
    </Box>
  );
};

export default MonthlyDepositForm;
