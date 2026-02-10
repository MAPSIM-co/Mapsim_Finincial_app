import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TypeTable = ({ data, typeName, onEdit, onDelete }) => {
  const displayName = typeName ? typeName.charAt(0).toUpperCase() + typeName.slice(1) : "";

  return (
    <TableContainer component={Paper} >
      <Table>
        <TableHead >
          <TableRow>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>شناسه</TableCell>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>موضوع</TableCell>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>بودجه</TableCell>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>بانک</TableCell>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>توضیحات</TableCell>
            <TableCell style={{ color: "#030303ff", fontWeight: "bold" }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell style={{ color: "#00b04fff", fontWeight: "bold" }}>{`${displayName}-${item.id}`}</TableCell>
              <TableCell style={{ color: "#6e0486ff", fontWeight: "bold" }}>{item.topic}</TableCell>
              <TableCell style={{ color: "darkgreen", fontWeight: "bold" }}>{`${(item.allocated_budget ?? 0).toLocaleString()} تومان`}</TableCell>
              
              <TableCell style={{ color: "Black", fontWeight: "bold" }}>{item.bank}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit && onEdit(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete && onDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TypeTable;