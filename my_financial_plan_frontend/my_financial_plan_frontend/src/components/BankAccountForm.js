import React, { useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";

const BankAccountForm = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState({
    bank_name: "",
    account_type: "",
    branch_code: "",
    account_number: "",
    sheba: "",
    card_number: "",
    expire_date: "",
    cvv2: "",
    description: "",
    color: "#000000",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        color: initialData.color || "#000000"
      });
    }
  }, [initialData]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      bank_name: "",
      account_type: "",
      branch_code: "",
      account_number: "",
      sheba: "",
      card_number: "",
      expire_date: "",
      cvv2: "",
      description: "",
      color: "#000000",
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField name="bank_name" label="نام بانک" value={form.bank_name} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="account_type" label="نوع حساب" value={form.account_type} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="branch_code" label="کد شعبه" value={form.branch_code} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="account_number" label="شماره حساب" value={form.account_number} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="sheba" label="شماره شبا" value={form.sheba} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="card_number" label="شماره کارت" value={form.card_number} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="expire_date" label="تاریخ انقضا" value={form.expire_date || ""} onChange={handleChange} fullWidth margin="dense" placeholder="MM/YY" InputProps={{ inputProps: { maxLength: 5 } }} />
      <TextField name="cvv2" label="CVV2" value={form.cvv2 || ""} onChange={handleChange} fullWidth margin="dense"/>
      <TextField name="description" label="توضیحات" value={form.description} onChange={handleChange} fullWidth margin="dense"/>
      <TextField
        name="color"
        label="رنگ بانک"
        type="color"
        value={form.color || "#000000"}
        onChange={handleChange}
        fullWidth
        margin="dense"
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>ذخیره</Button>
      

    </Box>
  );
};

export default BankAccountForm;