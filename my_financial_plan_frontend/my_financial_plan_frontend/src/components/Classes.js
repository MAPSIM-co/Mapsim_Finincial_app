import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField , IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api/api";  // فرض بر این است که axios یا مشابه آن تنظیم شده

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const loadClasses = async () => {
    try {
      const res = await api.get("/classes/");
      setClasses(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری کلاس‌ها:", err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleOpenForm = (cls = null) => {
    setEditClass(cls);
    setForm(cls ? { name: cls.name, description: cls.description } : { name: "", description: "" });
    setOpenForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editClass) {
        await api.put(`/classes/${editClass.id}`, form);
      } else {
        await api.post("/classes/", form);
      }
      loadClasses();
      setOpenForm(false);
    } catch (err) {
      console.error("خطا در ذخیره کلاس:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    try {
      await api.delete(`/classes/${id}`);
      loadClasses();
    } catch (err) {
      console.error("خطا در حذف کلاس:", err);
    }
  };

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
        افزودن کلاس جدید
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">نام کلاس</TableCell>
              <TableCell align="center">توضیحات</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {classes.map(cls => (
              <TableRow key={cls.id}>
                <TableCell align="center">{cls.id}</TableCell>
                <TableCell align="center">{cls.name}</TableCell>
                <TableCell align="center">{cls.description}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenForm(cls)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cls.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* فرم مودال */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editClass ? "ویرایش کلاس" : "افزودن کلاس جدید"}</DialogTitle>
        <DialogContent>
          <TextField
            label="نام کلاس"
            name="name"
            value={form.name}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSubmit}>ذخیره</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
