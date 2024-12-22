from transformers import AutoTokenizer, T5ForConditionalGeneration
import torch
from backend.locale.index import Messages

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("grammarly/coedit-xl")
model = T5ForConditionalGeneration.from_pretrained("grammarly/coedit-xl")


def auto_correct_text(input_text: str) -> str:
    
    if not input_text.strip():
        return ""
    
    if len(input_text)>500:
        print(len(input_text))
        return Messages.LENGTH_MSG
    
    try:
        input_ids = tokenizer(input_text, return_tensors="pt").input_ids
        outputs = model.generate(input_ids, max_length=256)
        edited_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return edited_text

    except Exception:
        return Messages.ERROR_MSG