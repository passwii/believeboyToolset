from flask import Blueprint, request, send_file
from PyPDF2 import PdfReader, PdfWriter
import os
from datetime import datetime
import zipfile

mic_pdf_bp = Blueprint('mic_pdf', __name__)

@mic_pdf_bp.route('/', methods=['POST'])
def process_mic_pdf():
    upload_folder = 'pdf/upload'
    os.makedirs(upload_folder, exist_ok=True)
    pdf_folder = 'pdf'
    os.makedirs(pdf_folder, exist_ok=True)

    uploaded_files = request.files.getlist("label_pdf")
    file2_path = "model_file/21PcsMIC.pdf"
    processed_files = []


    for uploaded_file in uploaded_files:
        file1_path = os.path.join(upload_folder, uploaded_file.filename)
        uploaded_file.save(file1_path)

        new_pdf = PdfReader(open(file2_path, 'rb'))
        existing_pdf = PdfReader(open(file1_path, 'rb'))
        output = PdfWriter()

        # 遍历上传文件的每一页
        for page_num in range(len(existing_pdf.pages)):
            page = existing_pdf.pages[page_num]
            page.merge_page(new_pdf.pages[0])
            output.add_page(page)

        output_filename = f"{os.path.splitext(uploaded_file.filename)[0]}-Merge.pdf"
        output_path = os.path.join(pdf_folder, output_filename)

        with open(output_path, "wb") as outputStream:
            output.write(outputStream)

        processed_files.append(output_path)

    zip_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_标签合集.zip"
    zip_path = os.path.join(pdf_folder, zip_filename)

    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for file_path in processed_files:
            zipf.write(file_path, os.path.basename(file_path))

    return send_file(zip_path, as_attachment=True)
