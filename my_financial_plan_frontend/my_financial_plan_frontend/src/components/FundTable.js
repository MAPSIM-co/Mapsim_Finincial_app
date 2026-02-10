// src/components/FundTable.js
import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Paper, TableContainer } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const FundTable = ({ funds = [], onSelect = () => {}, onEdit = () => {}, onDelete = () => {} }) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>نام صندوق</TableCell>
            <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>نوع</TableCell>
            <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>دوره تقسیم سود</TableCell>
            <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>روز تقسیم سود</TableCell>
            <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {funds.map((f) => (
            <TableRow key={f.id} hover>
              <TableCell onClick={() => onSelect(f)} sx={{ cursor: "pointer" }}>{f.fund_name}</TableCell>
              <TableCell>{f.fund_type}</TableCell>
              <TableCell>{f.payout_period}</TableCell>
              <TableCell>{f.payout_day}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => onEdit(f)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => onDelete(f.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {funds.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">موردی برای نمایش وجود ندارد.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FundTable;