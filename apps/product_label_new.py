from flask import Blueprint, request, send_file
import fitz  # PyMuPDF
import os
from datetime import datetime
import zipfile


product_label_new_bp = Blueprint('product_label_new', __name__)

@product_label_new_bp.route('/', methods=['POST'])
def process_product_label_new():
    # 获取上传的文件列表
    pdf_files = request.files.getlist("product_label_pdf")
    original_text = request.form['original_text']
    replacement_text = request.form['replacement_text']

    upload_folder = 'pdf/upload'
    output_folder = 'pdf/output'
    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)

    processed_files = []

    for pdf_file in pdf_files:
        # 保存上传的文件
        file_path = os.path.join(upload_folder, pdf_file.filename)
        pdf_file.save(file_path)

        # 打开PDF文件
        pdf_document = fitz.open(file_path)

        # 遍历每一页PDF
        for page in pdf_document:
            # 搜索文本
            areas = page.search_for(original_text)
            # 如果找到了文本，就替换它
            for rect in areas:
                # 调整矩形高度
                new_height = rect.height
                rect.y1 = rect.y0 + new_height
                
                page.add_redact_annot(rect)
                page.apply_redactions()
                # 直接在原始位置绘制新文字
                page.draw_text(rect.tl, replacement_text, fontsize=8, fontname="Times-Roman")

        # 保存修改后的PDF，保持原文件名加上日期后缀
        output_filename = f"{os.path.splitext(os.path.basename(file_path))[0]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        output_path = os.path.join(output_folder, output_filename)
        pdf_document.save(output_path)
        pdf_document.close()

        processed_files.append(output_path)

    # 如果只处理了一个文件，直接返回该文件
    if len(processed_files) == 1:
        return send_file(processed_files[0], as_attachment=True)

    # 如果处理了多个文件，将它们打包成zip文件
    zip_filename = f"product_label_new_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    zip_path = os.path.join(output_folder, zip_filename)

    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for file in processed_files:
            zipf.write(file, os.path.basename(file))

    print("PDF文件修改完成！")
    return send_file(zip_path, as_attachment=True)
    



        
