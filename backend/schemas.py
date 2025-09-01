from typing import Optional
from pydantic import BaseModel, Field, model_validator

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=255)

class TaskPatch(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    completed: Optional[bool] = None

    @model_validator(mode="after")
    def at_least_one_field(self):
        # Require at least one of title/completed
        if self.title is None and self.completed is None:
            raise ValueError("At least one of 'title' or 'completed' must be provided.")
        return self

class TaskOut(BaseModel):
    id: int
    title: str
    completed: bool

    class Config:
        from_attributes = True
