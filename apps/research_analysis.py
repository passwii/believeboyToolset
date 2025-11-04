import pandas as pd
import numpy as np
from datetime import datetime
import os
import json
import warnings
warnings.filterwarnings('ignore')

class ResearchAnalyzer:
    def __init__(self, excel_path):
        """初始化分析器"""
        self.excel_path = excel_path
        self.df = None
        self.analysis_results = {}

    def load_data(self):
        """加载Excel数据"""
        try:
            # 读取Excel文件的所有sheet
            excel_file = pd.ExcelFile(self.excel_path)
            print(f"Excel文件包含的工作表: {excel_file.sheet_names}")

            # 读取第一个工作表
            self.df = pd.read_excel(self.excel_path, sheet_name=0)
            print(f"数据行数: {len(self.df)}")
            print(f"数据列数: {len(self.df.columns)}")
            print(f"列名: {list(self.df.columns)}")

            return True
        except Exception as e:
            print(f"加载数据失败: {e}")
            return False

    def analyze_sales_by_price_range(self):
        """分析价格与销量占比关系"""
        try:
            # 假设价格列名包含"价格"或"price"
            price_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col).lower()
                if '价格' in col or 'price' in col_str:
                    price_col = col
                elif '预计listing月销量' in col or '销量' in col or 'sales' in col_str:
                    sales_col = col

            if price_col is None or sales_col is None:
                print(f"未找到价格或销量列 - 价格列: {price_col}, 销量列: {sales_col}")
                return None

            # 创建价格区间
            price_data = self.df[price_col].dropna()
            sales_data = self.df[sales_col].dropna()

            # 合并数据（确保索引一致）
            price_sales = pd.DataFrame({
                'price': price_data,
                'sales': self.df.loc[price_data.index, sales_col]
            }).dropna()

            if len(price_sales) == 0:
                return None

            # 创建价格区间
            price_sales['price_range'] = pd.cut(
                price_sales['price'],
                bins=5,
                labels=[f'区间{i+1}' for i in range(5)]
            )

            # 按价格区间统计
            result = price_sales.groupby('price_range').agg({
                'sales': ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            return result.to_dict()

        except Exception as e:
            print(f"价格分析失败: {e}")
            return None

    def analyze_sales_by_listing_days(self):
        """分析上架时间（上架天数）与销量占比关系"""
        try:
            # 找到上架天数列
            days_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if '上架天数' in col:
                    days_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if days_col is None or sales_col is None:
                print(f"未找到上架天数或销量列 - 上架天数列: {days_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[days_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 创建上架天数区间
            data['days_range'] = pd.cut(
                data[days_col],
                bins=5,
                labels=[f'{int(i*len(data)/5)}-{int((i+1)*len(data)/5)}天' for i in range(5)]
            )

            # 按天数区间统计
            result = data.groupby('days_range').agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            return result.to_dict()

        except Exception as e:
            print(f"上架时间分析失败: {e}")
            return None

    def analyze_sales_by_brand(self):
        """分析品牌与销量占比关系"""
        try:
            # 找到品牌列和销量列
            brand_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if '品牌' in col:
                    brand_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if brand_col is None or sales_col is None:
                print(f"未找到品牌或销量列 - 品牌列: {brand_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[brand_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 按品牌统计
            result = data.groupby(brand_col).agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            # 按总销量排序，取前20名
            result = result.sort_values('总销量', ascending=False).head(20)

            return result.to_dict()

        except Exception as e:
            print(f"品牌分析失败: {e}")
            return None

    def analyze_sales_by_review_count(self):
        """分析评价数量与销量占比关系"""
        try:
            # 找到评价数量列和销量列
            review_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if '评价数量' in col:
                    review_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if review_col is None or sales_col is None:
                print(f"未找到评价数量或销量列 - 评价数量列: {review_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[review_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 创建评价数量区间
            data['review_range'] = pd.cut(
                data[review_col],
                bins=5,
                labels=[f'区间{i+1}' for i in range(5)]
            )

            # 按评价数量区间统计
            result = data.groupby('review_range').agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            return result.to_dict()

        except Exception as e:
            print(f"评价数量分析失败: {e}")
            return None

    def analyze_sales_by_seller_type(self):
        """分析卖家属性与销量占比关系"""
        try:
            # 找到BBX卖家属性列和销量列
            seller_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if 'BBX卖家属性' in col:
                    seller_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if seller_col is None or sales_col is None:
                print(f"未找到卖家属性或销量列 - 卖家属性列: {seller_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[seller_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 按卖家属性统计
            result = data.groupby(seller_col).agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            return result.to_dict()

        except Exception as e:
            print(f"卖家属性分析失败: {e}")
            return None

    def analyze_sales_by_delivery_method(self):
        """分析配送方式与销量占比关系"""
        try:
            # 找到物流方式列和销量列
            delivery_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if '物流方式' in col:
                    delivery_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if delivery_col is None or sales_col is None:
                print(f"未找到物流方式或销量列 - 物流方式列: {delivery_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[delivery_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 按配送方式统计
            result = data.groupby(delivery_col).agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            return result.to_dict()

        except Exception as e:
            print(f"配送方式分析失败: {e}")
            return None

    def analyze_sales_by_seller_country(self):
        """分析卖家国籍与销量占比关系"""
        try:
            # 找到国籍/地区列和销量列
            country_col = None
            sales_col = None

            for col in self.df.columns:
                col_str = str(col)
                if '国籍/地区' in col:
                    country_col = col
                elif '预计listing月销量' in col or '销量' in col:
                    sales_col = col

            if country_col is None or sales_col is None:
                print(f"未找到国籍或销量列 - 国籍列: {country_col}, 销量列: {sales_col}")
                return None

            # 处理数据
            data = self.df[[country_col, sales_col]].dropna()

            if len(data) == 0:
                return None

            # 按卖家国籍统计
            result = data.groupby(country_col).agg({
                sales_col: ['sum', 'mean', 'count']
            }).round(2)

            result.columns = ['总销量', '平均销量', '商品数量']

            # 计算占比
            total_sales = result['总销量'].sum()
            result['销量占比'] = (result['总销量'] / total_sales * 100).round(2)

            # 按总销量排序，取前20名
            result = result.sort_values('总销量', ascending=False).head(20)

            return result.to_dict()

        except Exception as e:
            print(f"卖家国籍分析失败: {e}")
            return None

    def run_all_analysis(self):
        """运行所有分析"""
        if not self.load_data():
            return False

        print("\n开始数据分析...")

        # 执行各项分析
        self.analysis_results['price_analysis'] = self.analyze_sales_by_price_range()
        self.analysis_results['listing_days_analysis'] = self.analyze_sales_by_listing_days()
        self.analysis_results['brand_analysis'] = self.analyze_sales_by_brand()
        self.analysis_results['review_count_analysis'] = self.analyze_sales_by_review_count()
        self.analysis_results['seller_type_analysis'] = self.analyze_sales_by_seller_type()
        self.analysis_results['delivery_method_analysis'] = self.analyze_sales_by_delivery_method()
        self.analysis_results['seller_country_analysis'] = self.analyze_sales_by_seller_country()

        print("数据分析完成!")
        return True

    def get_results(self):
        """获取分析结果"""
        return self.analysis_results

    def save_results_to_excel(self, output_path):
        """保存分析结果到Excel文件"""
        if not self.analysis_results:
            print("没有分析结果可保存")
            return False

        try:
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                # 写入每个分析结果到不同的工作表
                for analysis_name, result in self.analysis_results.items():
                    if result is not None:
                        df_result = pd.DataFrame(result)
                        # 清理工作表名称
                        sheet_name = analysis_name.replace('_analysis', '').replace('_', ' ').title()
                        # 限制工作表名称长度
                        sheet_name = sheet_name[:31]
                        df_result.to_excel(writer, sheet_name=sheet_name, index=True)

            print(f"分析结果已保存到: {output_path}")
            return True
        except Exception as e:
            print(f"保存结果失败: {e}")
            return False


def analyze_excel_file(excel_path, output_path=None):
    """分析Excel文件的便捷函数"""
    analyzer = ResearchAnalyzer(excel_path)

    if analyzer.run_all_analysis():
        results = analyzer.get_results()

        if output_path:
            analyzer.save_results_to_excel(output_path)

        return results
    else:
        return None


if __name__ == "__main__":
    # 测试代码
    test_file = "test_data.xlsx"
    if os.path.exists(test_file):
        results = analyze_excel_file(test_file, "analysis_results.xlsx")
        if results:
            print("\n=== 分析结果预览 ===")
            for key, value in results.items():
                if value:
                    print(f"\n{key}:")
                    print(value)
    else:
        print(f"测试文件 {test_file} 不存在")
