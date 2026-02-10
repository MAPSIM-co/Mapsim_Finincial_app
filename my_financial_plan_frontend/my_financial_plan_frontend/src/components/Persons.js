// Components/Persons.js
import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton,
  Checkbox, FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api/api"; // فرض بر این است که axios یا مشابه آن تنظیم شده

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editPerson, setEditPerson] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    national_code: "",
    description: "",
    is_active: true,
  });

  // بارگذاری لیست اشخاص
  const loadPersons = async () => {
    try {
      const res = await api.get("/persons/");
      setPersons(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری اشخاص:", err);
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  // باز کردن فرم برای افزودن یا ویرایش
  const handleOpenForm = (person = null) => {
    setEditPerson(person);
    setForm(person ? {
      full_name: person.full_name || "",
      phone: person.phone || "",
      national_code: person.national_code || "",
      description: person.description || "",
      is_active: person.is_active !== undefined ? person.is_active : true,
    } : {
      full_name: "",
      phone: "",
      national_code: "",
      description: "",
      is_active: true,
    });
    setOpenForm(true);
  };

  // تغییر مقدار فیلدها
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // تغییر مقدار checkbox
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  // ذخیره یا بروزرسانی شخص
  const handleSubmit = async () => {
    try {
      if (editPerson) {
        await api.put(`/persons/${editPerson.id}`, form);
      } else {
        await api.post("/persons/", form);
      }
      loadPersons();
      setOpenForm(false);
    } catch (err) {
      console.error("خطا در ذخیره شخص:", err);
    }
  };

  // حذف شخص
  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    try {
      await api.delete(`/persons/${id}`);
      loadPersons();
    } catch (err) {
      console.error("خطا در حذف شخص:", err);
    }
  };

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
        افزودن فرد جدید
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* <TableCell align="center">ID</TableCell> */}
              <TableCell align="center">نام</TableCell>
              <TableCell align="center">شماره تماس</TableCell>
              <TableCell align="center">کد ملی</TableCell>
              <TableCell align="center">توضیحات</TableCell>
              <TableCell align="center">فعال</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {persons.map(person => (
              <TableRow key={person.id}>
                {/* <TableCell align="center">{person.id}</TableCell> */}
                <TableCell align="center">{person.full_name}</TableCell>
                <TableCell align="center">{person.phone}</TableCell>
                <TableCell align="center">{person.national_code}</TableCell>
                <TableCell align="center">{person.description}</TableCell>
                <TableCell align="center">
                  {person.is_active ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>✅</span>
                  ) : (
                    <span style={{ color: "red", fontWeight: "bold" }}>❌</span>
                  )}
                </TableCell>

                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenForm(person)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(person.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* فرم مودال */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editPerson ? "ویرایش شخص" : "افزودن فرد جدید"}</DialogTitle>
        <DialogContent>
          <TextField
            label="نام"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="شماره تماس"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="کد ملی"
            name="national_code"
            value={form.national_code}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="توضیحات"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_active}
                onChange={handleCheckboxChange}
                name="is_active"
              />
            }
            label={form.is_active ? "فعال است ✅" : "فعال نیست ❌"}
            sx={{ mt: 2 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit}>ذخیره</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
