# app/crud.py
from sqlalchemy.orm import Session
from app import models, schemas

# ---------------- بانک ----------------
def get_account(db: Session, account_id: int):
    return db.query(models.BankAccount).filter(models.BankAccount.id == account_id).first()

def get_accounts(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.BankAccount).offset(skip).limit(limit).all()

def create_account(db: Session, account: schemas.BankAccountCreate):
    db_obj = models.BankAccount(**account.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_account(db: Session, account_id: int, account: schemas.BankAccountUpdate):
    db_obj = get_account(db, account_id)
    if not db_obj:
        return None
    for key, value in account.dict(exclude_unset=True).items():
        setattr(db_obj, key, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_account(db: Session, account_id: int):
    db_obj = get_account(db, account_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj

# ---------------- Type1 تا Type5 ----------------
# توابع عمومی برای CRUD با نام بانک

def get_type_items(db: Session, model, skip: int = 0, limit: int = 1000):
    return get_type_items_with_bank(db, model, skip=skip, limit=limit)

def get_type_item(db: Session, model, item_id: int):
    return get_type_item_with_bank(db, model, item_id)

def create_type_item(db: Session, model, item):
    # تبدیل نام بانک به id
    item_dict = item.dict()
    if "bank" in item_dict:
        bank_obj = db.query(models.BankAccount).filter(models.BankAccount.bank_name == item_dict["bank"]).first()
        if not bank_obj:
            raise ValueError(f"Bank '{item_dict['bank']}' not found")
        item_dict["bank"] = bank_obj.id

    db_obj = model(**item_dict)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get_type_item_with_bank(db, model, db_obj.id)

def update_type_item(db: Session, model, item_id: int, item):
    db_obj = db.query(model).filter(model.id == item_id).first()
    if not db_obj:
        return None

    item_dict = item.dict(exclude_unset=True)
    # تبدیل نام بانک به id
    if "bank" in item_dict:
        bank_obj = db.query(models.BankAccount).filter(models.BankAccount.bank_name == item_dict["bank"]).first()
        if not bank_obj:
            raise ValueError(f"Bank '{item_dict['bank']}' not found")
        item_dict["bank"] = bank_obj.id

    for key, value in item_dict.items():
        setattr(db_obj, key, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get_type_item_with_bank(db, model, db_obj.id)

def delete_type_item(db: Session, model, item_id: int):
    db_obj = db.query(model).filter(model.id == item_id).first()
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return {"detail": "Deleted"}

# ---------------- Type Items با نام بانک ----------------
def get_type_items_with_bank(db: Session, model, skip: int = 0, limit: int = 1000):
    if not hasattr(model, "bank"):
        raise ValueError("مدل انتخاب شده ستون 'bank' ندارد")

    result = (
        db.query(
            model.id,
            *(col for col in model.__table__.columns if col.name != "bank"),
            models.BankAccount.bank_name.label("bank")
        )
        .join(models.BankAccount, model.bank == models.BankAccount.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return result

def get_type_item_with_bank(db: Session, model, item_id: int):
    if not hasattr(model, "bank"):
        raise ValueError("مدل انتخاب شده ستون 'bank' ندارد")

    result = (
        db.query(
            model.id,
            *(col for col in model.__table__.columns if col.name != "bank"),
            models.BankAccount.bank_name.label("bank")
        )
        .join(models.BankAccount, model.bank == models.BankAccount.id)
        .filter(model.id == item_id)
        .first()
    )
    return result





# -------------------- Investment Funds --------------------
def create_investment_fund(db: Session, fund: schemas.InvestmentFundCreate):
    db_obj = models.InvestmentFund(**fund.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_investment_funds(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.InvestmentFund).offset(skip).limit(limit).all()

def get_investment_fund(db: Session, fund_id: int):
    return db.query(models.InvestmentFund).filter(models.InvestmentFund.id == fund_id).first()

def update_investment_fund(db: Session, fund_id: int, fund):
    db_obj = get_investment_fund(db, fund_id)
    if not db_obj:
        return None
    for key, value in fund.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_obj, key, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_investment_fund(db: Session, fund_id: int):
    db_obj = get_investment_fund(db, fund_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj


# -------------------- Active Investments --------------------
def create_active_investment(db: Session, active: schemas.ActiveInvestmentCreate):
    db_obj = models.ActiveInvestment(**active.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_active_investments(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.ActiveInvestment).offset(skip).limit(limit).all()

def get_active_investment(db: Session, active_id: int):
    return db.query(models.ActiveInvestment).filter(models.ActiveInvestment.id == active_id).first()

def update_active_investment(db: Session, active_id: int, active):
    db_obj = get_active_investment(db, active_id)
    if not db_obj:
        return None
    for key, value in active.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_obj, key, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_active_investment(db: Session, active_id: int):
    db_obj = get_active_investment(db, active_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj


# app/crud.py


def get_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Class).offset(skip).limit(limit).all()

def get_class(db: Session, class_id: int):
    return db.query(models.Class).filter(models.Class.id == class_id).first()

def create_class(db: Session, class_in: schemas.ClassCreate):
    db_class = models.Class(**class_in.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def update_class(db: Session, class_id: int, class_in: schemas.ClassUpdate):
    db_class = get_class(db, class_id)
    if not db_class:
        return None
    for key, value in class_in.dict(exclude_unset=True).items():
        setattr(db_class, key, value)
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int):
    db_class = get_class(db, class_id)
    if not db_class:
        return None
    db.delete(db_class)
    db.commit()
    return db_class



# app/crud.py


def get_tuition_types(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TuitionTypes).offset(skip).limit(limit).all()

def get_tuition_type(db: Session, tuition_type_id: int):
    return db.query(models.TuitionTypes).filter(
        models.TuitionTypes.id == tuition_type_id
    ).first()

def create_tuition_type(db: Session, data: schemas.TuitionTypesCreate):
    db_obj = models.TuitionTypes(**data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_tuition_type(db: Session, tuition_type_id: int, data: schemas.TuitionTypesUpdate):
    db_obj = get_tuition_type(db, tuition_type_id)
    if not db_obj:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(db_obj, key, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_tuition_type(db: Session, tuition_type_id: int):
    db_obj = get_tuition_type(db, tuition_type_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj








# ------------------- Read all -------------------
def get_cheques(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cheques).offset(skip).limit(limit).all()

# ------------------- Read one -------------------
def get_cheque(db: Session, cheque_id: int):
    return db.query(models.Cheques).filter(models.Cheques.id == cheque_id).first()

# ------------------- Create -------------------
def create_cheque(db: Session, data: schemas.ChequeCreate):
    db_obj = models.Cheques(**data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ------------------- Update -------------------
def update_cheque(db: Session, cheque_id: int, data: schemas.ChequeUpdate):
    db_obj = get_cheque(db, cheque_id)
    if not db_obj:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(db_obj, key, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj

# ------------------- Delete -------------------
def delete_cheque(db: Session, cheque_id: int):
    db_obj = get_cheque(db, cheque_id)
    if not db_obj:
        return None
    db.delete(db_obj)
    db.commit()
    return db_obj










def get_persons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Person).offset(skip).limit(limit).all()


def get_person(db: Session, person_id: int):
    return db.query(models.Person).filter(models.Person.id == person_id).first()


def create_person(db: Session, person_in: schemas.PersonCreate):
    db_person = models.Person(**person_in.dict())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


def update_person(db: Session, person_id: int, person_in: schemas.PersonUpdate):
    db_person = get_person(db, person_id)
    if not db_person:
        return None

    for key, value in person_in.dict(exclude_unset=True).items():
        setattr(db_person, key, value)

    db.commit()
    db.refresh(db_person)
    return db_person


def delete_person(db: Session, person_id: int):
    db_person = get_person(db, person_id)
    if not db_person:
        return None

    db.delete(db_person)
    db.commit()
    return db_person






# دریافت همه رکوردها
def get_debtor_creditors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DebtorCreditor).offset(skip).limit(limit).all()

# دریافت یک رکورد
def get_debtor_creditor(db: Session, dc_id: int):
    return db.query(models.DebtorCreditor).filter(models.DebtorCreditor.id == dc_id).first()

# ایجاد رکورد جدید
def create_debtor_creditor(db: Session, dc_in: schemas.DebtorCreditorCreate):
    db_dc = models.DebtorCreditor(**dc_in.dict())
    db.add(db_dc)
    db.commit()
    db.refresh(db_dc)
    return db_dc

# بروزرسانی رکورد
def update_debtor_creditor(db: Session, dc_id: int, dc_in: schemas.DebtorCreditorUpdate):
    db_dc = get_debtor_creditor(db, dc_id)
    if not db_dc:
        return None
    for key, value in dc_in.dict(exclude_unset=True).items():
        setattr(db_dc, key, value)
    db.commit()
    db.refresh(db_dc)
    return db_dc

# حذف رکورد
def delete_debtor_creditor(db: Session, dc_id: int):
    db_dc = get_debtor_creditor(db, dc_id)
    if not db_dc:
        return None
    db.delete(db_dc)
    db.commit()
    return db_dc
