import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton
} from "@mui/material";
import { api } from "../api/api";
import GraduationForm from "./GraduationForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


const transactionTypeDisplay = {
  deposit: "واریز",
  withdraw: "برداشت",
};


export default function Graduation() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const loadData = () => {
    api.get("/Graduation/").then(res => setRows(res.data));
    
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این ردیف مطمئن هستید؟")) return;
    try {
      await api.delete(`/Graduation/${id}`);
      loadData();
    } catch (err) {
      console.error("خطا در حذف:", err);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setEditRow(null);
          setOpenForm(true);
        }}
      >
        ثبت واریز / برداشت شهریه
      </Button>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: "bold" }}>شناسه</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>عنوان</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>موضوع</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>بودجه اختصاص یافته</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>بانک</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>نوع تراکنش</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>مبلغ واریز شده</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>مبلغ برداشت شده</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>تاریخ تراکنش</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>موجودی قبل از واریز</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>موجودی بعد از واریز</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>توضیحات</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>مانده صندوق</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>عملیات</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell align="center">{row.id}</TableCell>
                <TableCell align="center">{row.items || "-"}</TableCell>
                <TableCell align="center">{row.topic || "-"}</TableCell>
                <TableCell align="center">{row.allocated_budget?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">{row.bank || "-"}</TableCell>
                <TableCell align="center">{transactionTypeDisplay[row.transaction_type] || "-"}</TableCell>
                <TableCell align="center">{row.amount?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">{row.withdrawn_amount?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">{row.transaction_date || "-"}</TableCell>
                <TableCell align="center">{row.saved_amount_before?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">{row.saved_amount?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">{row.description || "-"}</TableCell>
                <TableCell align="center">{row.saved_amount?.toLocaleString() || "-"}</TableCell>
                <TableCell align="center">
                  {/* <IconButton size="small" onClick={() => { setEditRow(row); setOpenForm(true); }}>
                    <EditIcon />
                  </IconButton> */}
                  <IconButton size="small" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <GraduationForm
        open={openForm}
        editData={editRow}
        onClose={() => setOpenForm(false)}
        onSaved={loadData}
      />
    </>
  );
}
