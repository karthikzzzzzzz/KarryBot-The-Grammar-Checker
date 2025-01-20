from transformers import AutoTokenizer, T5ForConditionalGeneration
import torch
from backend.locale.index import Messages
 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("grammarly/coedit-xl")
model = T5ForConditionalGeneration.from_pretrained("grammarly/coedit-xl")
 
def auto_correct_text(input_text: str) -> dict:
    
    try:
        input_ids = tokenizer(input_text, return_tensors="pt").input_ids
        outputs = model.generate(input_ids, max_length=256)
        edited_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        changes = []
        input_words = input_text.split()
        edited_words = edited_text.split()
        for i, (input_word, edited_word) in enumerate(zip(input_words, edited_words)):
            if input_word != edited_word:
                changes.append({"original": input_word, "corrected": edited_word, "position": i})
 
        return {"corrected_text": edited_text, "changes": changes}
 
    except Exception as e:
        print(f"Error: {e}")
        return {"error": Messages.ERROR_MSG}