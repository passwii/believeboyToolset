import pdfplumber
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import black
import os
import uuid


class SimplePDFProcessor:
    """简单可靠的PDF处理器 - 处理相邻字符组合替换"""
    
    def __init__(self, input_path, output_path=None):
        self.input_path = input_path
        self.output_path = output_path
        self.replacement_count = 0
        # 支持多字符组合替换
        self.replacement_rules = {
            '新品': 'NEW'
        }
    
    def process_pdf(self):
        """处理PDF文件 - 简化版本，支持字符组合替换"""
        try:
            if not os.path.exists(self.input_path):
                raise FileNotFoundError(f"文件不存在: {self.input_path}")
            
            # 生成输出路径
            if not self.output_path:
                filename = f"processed_{uuid.uuid4().hex[:8]}.pdf"
                temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                self.output_path = os.path.join(temp_dir, filename)
            
            self.replacement_count = 0
            
            # 创建新PDF
            c = canvas.Canvas(self.output_path, pagesize=A4)
            
            # 读取原PDF
            with pdfplumber.open(self.input_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # 处理页面内容并进行替换
                    self._process_page_with_combinations(c, page)
                    
                    # 新页面
                    if page_num < len(pdf.pages) - 1:
                        c.showPage()
            
            c.save()
            return True
            
        except Exception as e:
            print(f"PDF处理失败: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _process_page_with_combinations(self, canvas, page):
        """处理页面内容，支持字符组合替换"""
        try:
            chars = page.chars
            if not chars:
                return
            
            # 遍历字符进行组合检测和替换
            i = 0
            while i < len(chars):
                char = chars[i]
                
                # 检查是否与下一个字符形成组合
                replacement_made = False
                for old_combination, new_combination in self.replacement_rules.items():
                    if self._is_matching_combination(chars, i, old_combination):
                        # 绘制替换后的内容
                        self._draw_combination_replacement(canvas, char, new_combination)
                        self.replacement_count += 1
                        i += len(old_combination)  # 跳过已处理的字符
                        replacement_made = True
                        break
                
                if not replacement_made:
                    # 没有替换，绘制原字符
                    self._draw_single_char(canvas, char)
                    i += 1
            
        except Exception as e:
            print(f"页面处理失败: {e}")
            # 备用方案：绘制基本页面
            try:
                canvas.drawString(50, 50, "Page processed")
            except:
                pass
    
    def _is_matching_combination(self, chars, start_index, combination):
        """检查从指定位置开始是否匹配字符组合"""
        if start_index + len(combination) > len(chars):
            return False
        
        # 获取指定长度的字符文本
        combination_text = ""
        for j in range(len(combination)):
            combination_text += chars[start_index + j]['text']
        
        return combination_text == combination
    
    def _draw_combination_replacement(self, canvas, first_char, replacement_text):
        """绘制组合字符的替换内容"""
        try:
            # 使用第一个字符的位置作为起始点
            x = first_char['x0']
            y = first_char['top']
            
            # 设置字体大小为第一个字符的大小
            font_size = first_char.get('size', 10)
            canvas.setFont("Helvetica", font_size)
            
            # 绘制替换后的文本
            canvas.drawString(x, y, replacement_text)
            
        except Exception as e:
            print(f"绘制替换内容失败: {e}")
    
    def _draw_single_char(self, canvas, char):
        """绘制单个字符"""
        try:
            x = char['x0']
            y = char['top']
            text = char['text']
            
            # 设置字体
            font_size = char.get('size', 10)
            canvas.setFont("Helvetica", font_size)
            
            # 绘制字符
            canvas.drawString(x, y, text)
            
        except Exception as e:
            print(f"绘制字符失败: {e}")
    
    def get_replacement_count(self):
        """获取替换次数"""
        return self.replacement_count
    
    def get_output_path(self):
        """获取输出文件路径"""
        return self.output_path


# 便捷函数
def quick_process_pdf(input_path):
    """
    快速处理PDF文件 - 极简版本
    :param input_path: 输入PDF路径
    :return: 处理结果字典
    """
    processor = SimplePDFProcessor(input_path)
    
    # 执行处理
    if processor.process_pdf():
        return {
            'success': True,
            'output_path': processor.get_output_path(),
            'replacement_count': processor.get_replacement_count(),
            'message': f'成功替换 {processor.get_replacement_count()} 处 "新品" 为 "NEW"'
        }
    else:
        return {
            'success': False,
            'error': 'PDF处理失败'
        }


def batch_process_pdfs(input_folder):
    """
    批量处理文件夹中的所有PDF文件
    :param input_folder: 输入文件夹路径
    :return: 处理结果列表
    """
    results = []
    
    if not os.path.exists(input_folder):
        return [{'success': False, 'error': '文件夹不存在'}]
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith('.pdf'):
            file_path = os.path.join(input_folder, filename)
            result = quick_process_pdf(file_path)
            result['filename'] = filename
            results.append(result)
    
    return results


if __name__ == "__main__":
    # 测试代码
    test_file = "../tests/productLabel.pdf"
    if os.path.exists(test_file):
        print("开始测试简化PDF处理器...")
        result = quick_process_pdf(test_file)
        if result['success']:
            print(f"✅ 处理成功!")
            print(f"输出文件: {result['output_path']}")
            print(f"替换次数: {result['replacement_count']}")
            print(f"详细信息: {result['message']}")
        else:
            print(f"❌ 处理失败: {result['error']}")
    else:
        print(f"❌ 测试文件不存在: {test_file}")