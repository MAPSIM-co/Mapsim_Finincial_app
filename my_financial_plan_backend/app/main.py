# app/main.py

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app import models, schemas, crud
from app.db import engine, Base, get_db
from app.models import (
    Type1, Type2, Type3, Type4, Type5,
    InvestmentFund, ActiveInvestment,
    MonthlyDeposit, MonthlyWithdrawal,Graduation 
)

from typing import List
from app.schemas import GraduationCreate, GraduationUpdate, GraduationOut , LastBalanceOut


# ایجاد جداول
Base.metadata.create_all(bind=engine)

app = FastAPI(title="My Financial Plan API")

# CORS

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # 🔥 فرانت production wit nginx
    #"http://<Your-Ip-Server>",
    #"http://<Your-Ip-Server>:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"msg": "My Financial Plan API is running."}

# ---------------------- بانک ----------------------
@app.post("/accounts/", response_model=schemas.BankAccountOut)
def create_account(account: schemas.BankAccountCreate, db: Session = Depends(get_db)):
    return crud.create_account(db=db, account=account)

@app.get("/accounts/", response_model=list[schemas.BankAccountOut])
def list_accounts(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return crud.get_accounts(db=db, skip=skip, limit=limit)

@app.get("/accounts/{account_id}", response_model=schemas.BankAccountOut)
def get_account(account_id: int, db: Session = Depends(get_db)):
    acc = crud.get_account(db, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

@app.put("/accounts/{account_id}", response_model=schemas.BankAccountOut)
def update_account(account_id: int, account: schemas.BankAccountUpdate, db: Session = Depends(get_db)):
    updated = crud.update_account(db, account_id, account)
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated

@app.delete("/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_account(db, account_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"detail": "Deleted"}

# ---------------------- Type1 تا Type5 ----------------------
def register_type_routes(model, prefix: str, create_schema, out_schema):

    @app.get(f"/{prefix}/", response_model=list[out_schema])
    def list_items(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
        # اگر مدل فیلد بانک دارد → حتماً JOIN کن
        if hasattr(model, "bank"):
            return crud.get_type_items_with_bank(db, model, skip=skip, limit=limit)
        
        return crud.get_type_items(db, model, skip=skip, limit=limit)

    @app.get(f"/{prefix}/{{item_id}}", response_model=out_schema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        if hasattr(model, "bank"):
            item = crud.get_type_item_with_bank(db, model, item_id)
        else:
            item = crud.get_type_item(db, model, item_id)

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item


    @app.post(f"/{prefix}/", response_model=out_schema)
    def create_item(item: create_schema, db: Session = Depends(get_db)):
        try:
            return crud.create_type_item(db, model, item)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @app.put(f"/{prefix}/{{item_id}}", response_model=out_schema)
    def update_item(item_id: int, item: create_schema, db: Session = Depends(get_db)):
        updated = crud.update_type_item(db, model, item_id, item)
        if not updated:
            raise HTTPException(status_code=404, detail="Item not found")
        return updated

    @app.delete(f"/{prefix}/{{item_id}}")
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        deleted = crud.delete_type_item(db, model, item_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"detail": "Deleted"}

# ثبت مسیرهای Type1 تا Type5
register_type_routes(Type1, "type1", schemas.Type1Create, schemas.Type1Out)
register_type_routes(Type2, "type2", schemas.Type2Create, schemas.Type2Out)
register_type_routes(Type3, "type3", schemas.Type3Create, schemas.Type3Out)
register_type_routes(Type4, "type4", schemas.Type4Create, schemas.Type4Out)
register_type_routes(Type5, "type5", schemas.Type5Create, schemas.Type5Out)

# -------------------- Monthly Deposits routes --------------------
register_type_routes(MonthlyDeposit, "monthly-deposits", schemas.MonthlyDepositCreate, schemas.MonthlyDepositOut )

# -------------------- Monthly Withdrawals routes --------------------
register_type_routes(MonthlyWithdrawal, "monthly-withdrawals", schemas.MonthlyWithdrawalCreate, schemas.MonthlyWithdrawalOut )


# -------------------- Bank balance (aggregation) --------------------
# @app.get("/bank-balance/")
# def get_bank_balance(bank_name: str, year: int, month: int, day: int, db: Session = Depends(get_db)):
#     # build date strings
#     month_str = str(month).zfill(2)
#     day_str = str(day).zfill(2)
#     date_str = f"{year}-{month_str}-{day_str}"
#     like_prefix = f"{year}-{month_str}-%"

#     total_q = db.query(func.coalesce(func.sum(models.MonthlyWithdrawal.remaining_balance), 0)).filter(
#         models.MonthlyWithdrawal.bank == bank_name,
#         models.MonthlyWithdrawal.withdrawal_date.like(like_prefix),
#         models.MonthlyWithdrawal.withdrawal_date <= date_str
#     )
#     total = total_q.scalar() or 0
#     return {"bank": bank_name, "date": date_str, "balance": int(total)}

# ----------- Investment Funds (صندوق‌ها) -----------

@app.post("/investment-funds/", response_model=schemas.InvestmentFundOut)
def create_fund(fund: schemas.InvestmentFundCreate, db: Session = Depends(get_db)):
    return crud.create_investment_fund(db=db, fund=fund)

@app.get("/investment-funds/types")
def get_fund_types(db: Session = Depends(get_db)):
    result = db.query(InvestmentFund.fund_type).distinct().all()
    return [row[0] for row in result]

@app.get("/investment-funds/")
def get_all_funds(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return crud.get_investment_funds(db=db, skip=skip, limit=limit)

@app.get("/investment-funds/{fund_id}", response_model=schemas.InvestmentFundOut)
def get_fund(fund_id: int, db: Session = Depends(get_db)):
    fund = crud.get_investment_fund(db, fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    return fund

@app.put("/investment-funds/{fund_id}", response_model=schemas.InvestmentFundOut)
def update_fund(fund_id: int, fund: schemas.InvestmentFundUpdate, db: Session = Depends(get_db)):
    updated = crud.update_investment_fund(db, fund_id, fund)
    if not updated:
        raise HTTPException(status_code=404, detail="Fund not found")
    return updated

@app.delete("/investment-funds/{fund_id}")
def delete_fund(fund_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_investment_fund(db, fund_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Fund not found")
    return {"detail": "Deleted"}

# ----------- Active Investments (سرمایه گذاری‌های فعال) -----------

@app.post("/active-investments/", response_model=schemas.ActiveInvestmentOut)
def create_active_investment(active: schemas.ActiveInvestmentCreate, db: Session = Depends(get_db)):
    return crud.create_active_investment(db=db, active=active)

@app.get("/active-investments/by-fund-type/{fund_type}", response_model=list[schemas.ActiveInvestmentOut])
def get_active_investments_by_type(fund_type: str, db: Session = Depends(get_db)):
    results = db.query(
        ActiveInvestment,
        InvestmentFund.fund_name
    ).join(
        InvestmentFund, ActiveInvestment.fund_id == InvestmentFund.id
    ).filter(
        InvestmentFund.fund_type == fund_type
    ).all()
    
    # تبدیل نتایج به صورتی که schema دوست دارد
    return [
        {
            **{col.name: getattr(active, col.name) for col in ActiveInvestment.__table__.columns},
            "fund_name": fund_name
        }
        for active, fund_name in results
    ]

@app.get("/active-investments/")
def get_all_active_investments(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return crud.get_active_investments(db=db, skip=skip, limit=limit)

@app.get("/active-investments/{active_id}", response_model=schemas.ActiveInvestmentOut)
def get_active_investment(active_id: int, db: Session = Depends(get_db)):
    active = crud.get_active_investment(db, active_id)
    if not active:
        raise HTTPException(status_code=404, detail="Active investment not found")
    return active

@app.put("/active-investments/{active_id}", response_model=schemas.ActiveInvestmentOut)
def update_active_investment(active_id: int, active: schemas.ActiveInvestmentUpdate, db: Session = Depends(get_db)):
    updated = crud.update_active_investment(db, active_id, active)
    if not updated:
        raise HTTPException(status_code=404, detail="Active investment not found")
    return updated

@app.delete("/active-investments/{active_id}")
def delete_active_investment(active_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_active_investment(db, active_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Active investment not found")
    return {"detail": "Deleted"}

# ----------- Bank Balance (مانده حساب‌های بانکی) -----------


@app.get("/bank-balance/")
def get_bank_balance(
    bank_name: str,
    year: int,
    month: int,
    day: int,
    db: Session = Depends(get_db)
):
    # 1) شناسایی بانک
    if bank_name.isdigit():
        bank_id = int(bank_name)
    else:
        bank_obj = db.query(models.Bank).filter(models.Bank.name == bank_name).first()
        if not bank_obj:
            raise HTTPException(status_code=404, detail="Bank not found")
        bank_id = bank_obj.id

    # 2) تاریخ
    month_str = str(month).zfill(2)
    day_str = str(day).zfill(2)
    date_str = f"{year}-{month_str}-{day_str}"

    # 3) مجموع balance_after واریزی‌ها تا تاریخ
    deposit_balance = db.query(func.sum(models.MonthlyDeposit.balance_after))\
                        .filter(models.MonthlyDeposit.bank == bank_id,
                                models.MonthlyDeposit.deposit_date <= date_str)\
                        .scalar() or 0

    # 4) مجموع برداشت‌ها تا تاریخ
    withdrawal_total = db.query(func.sum(models.MonthlyWithdrawal.total_out))\
                         .filter(models.MonthlyWithdrawal.bank == bank_id,
                                 models.MonthlyWithdrawal.withdrawal_date <= date_str)\
                         .scalar() or 0

    # 5) موجودی نهایی
    final_balance = deposit_balance - withdrawal_total

    

    

    return {
        "bank_id": bank_id,
        "bank_name": bank_name,
        "date": date_str,
        "last_deposit_balance": deposit_balance,
        "total_withdrawals": withdrawal_total,
        "final_balance": final_balance
    }


# ----------- Graduation (شهریه مدرسه) -----------

# ------------------ Graduation Ledger ------------------


@app.get("/Graduation/", response_model=List[GraduationOut])
def list_graduations(
    type_name: str | None = None,
    item_id: int | None = None,
    db: Session = Depends(get_db)
):
    q = db.query(Graduation)

    if type_name:
        q = q.filter(Graduation.type_name == type_name)
    if item_id:
        q = q.filter(Graduation.item_id == item_id)

    return q.order_by(
        Graduation.transaction_date.desc(),
        Graduation.id.desc()
    ).all()





@app.get("/Graduation/last-balance", response_model=LastBalanceOut)
def get_last_balance(db: Session = Depends(get_db)):
    last = (
        db.query(Graduation)
        .order_by(Graduation.id.desc())
        .first()
    )

    return {
        "saved_amount": last.saved_amount if last else 0
    }


@app.get("/Graduation/{grad_id}", response_model=GraduationOut)
def get_graduation(grad_id: int, db: Session = Depends(get_db)):
    obj = db.query(Graduation).filter(Graduation.id == grad_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Graduation not found")
    return obj




@app.post("/Graduation/", response_model=GraduationOut)
def create_graduation(
    data: GraduationCreate,
    db: Session = Depends(get_db)
):
    obj = Graduation(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    response_data = GraduationOut.from_orm(obj).model_dump()  # Pydantic v2: model_dump بجای dict
    response_data["transaction_date"] = obj.transaction_date.strftime("%Y-%m-%d")
    return obj


@app.put("/Graduation/{grad_id}", response_model=GraduationOut)
def update_graduation(
    grad_id: int,
    data: GraduationUpdate,
    db: Session = Depends(get_db)
):
    obj = db.query(Graduation).filter(Graduation.id == grad_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Graduation not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(obj, field, value)

    db.commit()
    db.refresh(obj)
    return obj


@app.delete("/Graduation/{grad_id}")
def delete_graduation(grad_id: int, db: Session = Depends(get_db)):
    obj = db.query(Graduation).filter(Graduation.id == grad_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Graduation not found")

    db.delete(obj)
    db.commit()
    return {"detail": "Deleted"}



# app/main.py




@app.get("/classes/", response_model=list[schemas.ClassOut])
def list_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_classes(db, skip, limit)

@app.post("/classes/", response_model=schemas.ClassOut)
def create_class(class_in: schemas.ClassCreate, db: Session = Depends(get_db)):
    return crud.create_class(db, class_in)

@app.put("/classes/{class_id}", response_model=schemas.ClassOut)
def update_class(class_id: int, class_in: schemas.ClassUpdate, db: Session = Depends(get_db)):
    db_class = crud.update_class(db, class_id, class_in)
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return db_class

@app.delete("/classes/{class_id}", response_model=schemas.ClassOut)
def delete_class(class_id: int, db: Session = Depends(get_db)):
    db_class = crud.delete_class(db, class_id)
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return db_class



# app/main.py


@app.get("/tuition-types/", response_model=list[schemas.TuitionTypesOut])
def list_tuition_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_tuition_types(db, skip, limit)

@app.post("/tuition-types/", response_model=schemas.TuitionTypesOut)
def create_tuition_type(data: schemas.TuitionTypesCreate, db: Session = Depends(get_db)):
    return crud.create_tuition_type(db, data)

@app.put("/tuition-types/{tuition_type_id}", response_model=schemas.TuitionTypesOut)
def update_tuition_type(
    tuition_type_id: int,
    data: schemas.TuitionTypesUpdate,
    db: Session = Depends(get_db)
):
    obj = crud.update_tuition_type(db, tuition_type_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Tuition type not found")
    return obj

@app.delete("/tuition-types/{tuition_type_id}", response_model=schemas.TuitionTypesOut)
def delete_tuition_type(tuition_type_id: int, db: Session = Depends(get_db)):
    obj = crud.delete_tuition_type(db, tuition_type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tuition type not found")
    return obj







# -------------------- List --------------------
@app.get("/cheques/", response_model=List[schemas.ChequeOut])
def list_cheques(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cheques(db, skip, limit)

# -------------------- Create --------------------


@app.post("/cheques/", response_model=schemas.ChequeOut)
def create_cheque(data: schemas.ChequeCreate, db: Session = Depends(get_db)):
    return crud.create_cheque(db, data)

# -------------------- Update --------------------
@app.put("/cheques/{cheque_id}", response_model=schemas.ChequeOut)
def update_cheque(cheque_id: int, data: schemas.ChequeUpdate, db: Session = Depends(get_db)):
    obj = crud.update_cheque(db, cheque_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Cheque not found")
    return obj

# -------------------- Delete --------------------
@app.delete("/cheques/{cheque_id}", response_model=schemas.ChequeOut)
def delete_cheque(cheque_id: int, db: Session = Depends(get_db)):
    obj = crud.delete_cheque(db, cheque_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cheque not found")
    return obj






@app.get("/persons/", response_model=list[schemas.PersonOut])
def list_persons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_persons(db, skip, limit)


@app.post("/persons/", response_model=schemas.PersonOut)
def create_persons(
    person_in: schemas.PersonCreate,
    db: Session = Depends(get_db)
):
    return crud.create_person(db, person_in)


@app.put("/persons/{person_id}", response_model=schemas.PersonOut)
def update_persons(
    person_id: int,
    person_in: schemas.PersonUpdate,
    db: Session = Depends(get_db)
):
    db_person = crud.update_person(db, person_id, person_in)
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    return db_person


@app.delete("/persons/{person_id}", response_model=schemas.PersonOut)
def delete_persons(
    person_id: int,
    db: Session = Depends(get_db)
):
    db_person = crud.delete_person(db, person_id)
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    return db_person









# دریافت همه رکوردها
@app.get("/debtor_creditor/", response_model=list[schemas.DebtorCreditorOut])
def list_debtor_creditors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_debtor_creditors(db, skip, limit)

# دریافت یک رکورد
@app.get("/debtor_creditor/{dc_id}", response_model=schemas.DebtorCreditorOut)
def get_debtor_creditor(dc_id: int, db: Session = Depends(get_db)):
    db_dc = crud.get_debtor_creditor(db, dc_id)
    if not db_dc:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_dc

# ایجاد رکورد جدید
@app.post("/debtor_creditor/", response_model=schemas.DebtorCreditorOut)
def create_debtor_creditor(dc_in: schemas.DebtorCreditorCreate, db: Session = Depends(get_db)):
    return crud.create_debtor_creditor(db, dc_in)

# بروزرسانی رکورد
@app.put("/debtor_creditor/{dc_id}", response_model=schemas.DebtorCreditorOut)
def update_debtor_creditor(dc_id: int, dc_in: schemas.DebtorCreditorUpdate, db: Session = Depends(get_db)):
    db_dc = crud.update_debtor_creditor(db, dc_id, dc_in)
    if not db_dc:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_dc

# حذف رکورد
@app.delete("/debtor_creditor/{dc_id}", response_model=schemas.DebtorCreditorOut)
def delete_debtor_creditor(dc_id: int, db: Session = Depends(get_db)):
    db_dc = crud.delete_debtor_creditor(db, dc_id)
    if not db_dc:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_dc