/**
 * SKU 成本表管理组件
 * 提供 CSV 数据的加载、编辑、搜索和保存功能
 */

class SkuCostManager {
  constructor() {
    this.originalData = [];      // 原始数据
    this.filteredData = [];      // 过滤后的数据
    this.modifiedRows = new Set(); // 已修改的行索引
    this.currentPage = 1;
    this.pageSize = 20;
    this.projects = new Set();   // 所有项目名称
    this.isLoading = false;
    
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadData();
  }

  /**
   * 缓存 DOM 元素
   */
  cacheElements() {
    // 工具栏元素
    this.searchInput = document.getElementById('search-input');
    this.filterProject = document.getElementById('filter-project');
    this.refreshBtn = document.getElementById('refresh-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.addItemBtn = document.getElementById('add-item-btn');
    this.batchAddBtn = document.getElementById('batch-add-btn');

    // 表格元素
    this.tableBody = document.getElementById('table-body');

    // 分页元素
    this.prevPageBtn = document.getElementById('prev-page');
    this.nextPageBtn = document.getElementById('next-page');
    this.currentPageSpan = document.getElementById('current-page');
    this.totalPagesSpan = document.getElementById('total-pages');

    // 统计元素
    this.totalRecordsSpan = document.getElementById('total-records');
    this.filteredRecordsSpan = document.getElementById('filtered-records');
    this.modifiedRecordsSpan = document.getElementById('modified-records');

    // 模态框元素
    this.saveModal = document.getElementById('save-modal');
    this.modalClose = document.getElementById('modal-close');
    this.modalCancel = document.getElementById('modal-cancel');
    this.modalConfirm = document.getElementById('modal-confirm');
    this.modalModifiedCount = document.getElementById('modal-modified-count');
    this.addItemModal = document.getElementById('add-item-modal');
    this.addItemModalClose = document.getElementById('add-item-modal-close');
    this.addItemCancel = document.getElementById('add-item-cancel');
    this.addItemConfirm = document.getElementById('add-item-confirm');
    this.addItemForm = document.getElementById('add-item-form');
    this.addProject = document.getElementById('add-project');
    this.addSku = document.getElementById('add-sku');
    this.addAsin = document.getElementById('add-asin');
    this.addHeadTripCost = document.getElementById('add-head-trip-cost');
    this.addFobCost = document.getElementById('add-fob-cost');
    this.addProjectError = document.getElementById('add-project-error');
    this.addSkuError = document.getElementById('add-sku-error');
    this.batchAddModal = document.getElementById('batch-add-modal');
    this.batchAddModalClose = document.getElementById('batch-add-modal-close');
    this.batchAddCancel = document.getElementById('batch-add-cancel');
    this.batchAddConfirm = document.getElementById('batch-add-confirm');
    this.batchTabs = document.querySelectorAll('.batch-tab');
    this.batchContents = document.querySelectorAll('.batch-content');
    this.batchPasteInput = document.getElementById('batch-paste-input');
    this.batchPastePreview = document.getElementById('batch-paste-preview');
    this.batchTablePreview = document.getElementById('batch-table-preview');
    this.batchTableBody = document.getElementById('batch-table-body');
    this.addBatchRowBtn = document.getElementById('add-batch-row');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 搜索和过滤
    this.searchInput?.addEventListener('input', this.debounce(() => {
      this.currentPage = 1;
      this.filterData();
    }, 300));

    this.filterProject?.addEventListener('change', () => {
      this.currentPage = 1;
      this.filterData();
    });

    // 按钮事件
    this.refreshBtn?.addEventListener('click', () => this.loadData());
    this.saveBtn?.addEventListener('click', () => this.showSaveModal());
    this.addItemBtn?.addEventListener('click', () => this.openAddItemModal());
    this.batchAddBtn?.addEventListener('click', () => this.openBatchAddModal());

    // 分页事件
    this.prevPageBtn?.addEventListener('click', () => this.goToPrevPage());
    this.nextPageBtn?.addEventListener('click', () => this.goToNextPage());

    // 模态框事件
    this.modalClose?.addEventListener('click', () => this.hideSaveModal());
    this.modalCancel?.addEventListener('click', () => this.hideSaveModal());
    this.modalConfirm?.addEventListener('click', () => this.saveData());
    this.addItemModalClose?.addEventListener('click', () => this.hideModal(this.addItemModal));
    this.addItemCancel?.addEventListener('click', () => this.hideModal(this.addItemModal));
    this.addItemConfirm?.addEventListener('click', () => this.handleSingleAdd());
    this.batchAddModalClose?.addEventListener('click', () => this.hideModal(this.batchAddModal));
    this.batchAddCancel?.addEventListener('click', () => this.hideModal(this.batchAddModal));
    this.batchAddConfirm?.addEventListener('click', () => this.handleBatchAdd());
    this.addBatchRowBtn?.addEventListener('click', () => this.addBatchInputRow());
    this.batchPasteInput?.addEventListener('input', () => this.updateBatchPastePreview());
    this.batchTabs?.forEach(tab => {
      tab.addEventListener('click', () => this.switchBatchTab(tab.dataset.tab));
    });

    // 点击模态框外部关闭
    this.saveModal?.addEventListener('click', (e) => {
      if (e.target === this.saveModal) {
        this.hideSaveModal();
      }
    });
    this.addItemModal?.addEventListener('click', (e) => {
      if (e.target === this.addItemModal) {
        this.hideModal(this.addItemModal);
      }
    });
    this.batchAddModal?.addEventListener('click', (e) => {
      if (e.target === this.batchAddModal) {
        this.hideModal(this.batchAddModal);
      }
    });
  }

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 加载数据
   */
  async loadData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      const response = await fetch('/toolset/sku-cost');
      const result = await response.json();

      if (result.success) {
        this.originalData = result.data || [];
        this.extractProjects();
        this.renderProjectFilterOptions();
        this.renderAddProjectOptions();
        this.modifiedRows.clear();
        this.filterData();
        notify.success('数据加载成功');
      } else {
        throw new Error(result.message || '加载数据失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      notify.error('加载数据失败: ' + error.message);
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  /**
   * 提取所有项目名称
   */
  extractProjects() {
    this.projects.clear();
    this.originalData.forEach(row => {
      if (row.project_name) {
        this.projects.add(row.project_name);
      }
    });
  }

  renderProjectFilterOptions() {
    if (!this.filterProject) return;
    this.filterProject.innerHTML = '<option value="">所有项目</option>';
    Array.from(this.projects).sort().forEach(project => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      this.filterProject.appendChild(option);
    });
  }

  renderAddProjectOptions() {
    if (!this.addProject) return;
    this.addProject.innerHTML = '<option value="">请选择项目</option>';
    Array.from(this.projects).sort().forEach(project => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      this.addProject.appendChild(option);
    });
  }

  /**
   * 过滤数据
   */
  filterData() {
    const searchTerm = this.searchInput?.value?.toLowerCase() || '';
    const projectFilter = this.filterProject?.value || '';

    this.filteredData = this.originalData.filter(row => {
      // 项目过滤
      if (projectFilter && row.project_name !== projectFilter) {
        return false;
      }

      // 搜索过滤
      if (searchTerm) {
        const searchableText = [
          row.SKU,
          row.ASIN,
          row.project_name
        ].join(' ').toLowerCase();
        return searchableText.includes(searchTerm);
      }

      return true;
    });

    this.updateStats();
    this.renderTable();
    this.updatePagination();
  }

  /**
   * 更新统计信息
   */
  updateStats() {
    if (this.totalRecordsSpan) {
      this.totalRecordsSpan.textContent = this.originalData.length;
    }
    if (this.filteredRecordsSpan) {
      this.filteredRecordsSpan.textContent = this.filteredData.length;
    }
    if (this.modifiedRecordsSpan) {
      this.modifiedRecordsSpan.textContent = this.modifiedRows.size;
    }
  }

  /**
   * 渲染表格
   */
  renderTable() {
    if (!this.tableBody) return;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredData.length);
    const pageData = this.filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center" style="padding: 40px; color: rgba(255,255,255,0.5);">
            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
            暂无数据
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = pageData.map((row, index) => {
      const actualIndex = startIndex + index;
      const isModified = this.modifiedRows.has(actualIndex);
      const originalRow = this.originalData[actualIndex];
      
      return `
        <tr class="${isModified ? 'modified' : ''}" data-index="${actualIndex}">
          <td class="col-project">${this.escapeHtml(row.project_name || '')}</td>
          <td class="col-sku">${this.escapeHtml(row.SKU || '')}</td>
          <td class="col-asin">${this.escapeHtml(row.ASIN || '')}</td>
          <td class="col-cost editable-cell" data-field="头程单价" data-original="${originalRow?.['头程单价'] || ''}">
            ${row['头程单价'] || '0'}
            <i class="fas fa-edit edit-icon"></i>
          </td>
          <td class="col-fob editable-cell" data-field="FOB单价" data-original="${originalRow?.['FOB单价'] || ''}">
            ${row['FOB单价'] || '0'}
            <i class="fas fa-edit edit-icon"></i>
          </td>
        </tr>
      `;
    }).join('');

    // 绑定单元格编辑事件
    this.bindCellEditEvents();
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 绑定单元格编辑事件
   */
  bindCellEditEvents() {
    const editableCells = this.tableBody?.querySelectorAll('.editable-cell');
    editableCells?.forEach(cell => {
      cell.addEventListener('click', (e) => this.handleCellClick(e, cell));
    });
  }

  /**
   * 处理单元格点击
   */
  handleCellClick(e, cell) {
    // 如果已经在编辑中，则不处理
    if (cell.querySelector('input')) return;

    const currentValue = cell.childNodes[0].textContent.trim();
    const field = cell.dataset.field;
    const row = cell.closest('tr');
    const rowIndex = parseInt(row.dataset.index);

    // 创建输入框
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.value = currentValue;
    input.style.width = '100%';

    // 清空单元格并添加输入框
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    // 处理保存
    const saveEdit = () => {
      const newValue = input.value.trim();
      const numValue = parseFloat(newValue);

      if (isNaN(numValue)) {
        notify.error('请输入有效的数字');
        input.focus();
        return;
      }

      // 更新数据
      const actualIndex = this.filteredData[rowIndex] ? 
        this.originalData.findIndex(item => 
          item.SKU === this.filteredData[rowIndex].SKU && 
          item.ASIN === this.filteredData[rowIndex].ASIN
        ) : -1;

      if (actualIndex !== -1) {
        const oldValue = this.originalData[actualIndex][field];
        this.originalData[actualIndex][field] = numValue.toString();
        
        // 标记为已修改
        this.modifiedRows.add(actualIndex);
        
        // 更新过滤后的数据
        this.filteredData[rowIndex][field] = numValue.toString();

        // 显示修改标记
        row.classList.add('modified');
        
        // 更新统计
        this.updateStats();

        // 显示通知
        if (oldValue !== numValue.toString()) {
          notify.success(`已更新 ${field}`);
        }
      }

      // 恢复单元格显示
      cell.innerHTML = `${numValue}<i class="fas fa-edit edit-icon"></i>`;
    };

    // 处理取消
    const cancelEdit = () => {
      cell.innerHTML = `${currentValue}<i class="fas fa-edit edit-icon"></i>`;
    };

    // 绑定事件
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });
  }

  /**
   * 更新分页
   */
  updatePagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    
    if (this.currentPageSpan) {
      this.currentPageSpan.textContent = this.currentPage;
    }
    if (this.totalPagesSpan) {
      this.totalPagesSpan.textContent = totalPages;
    }
    if (this.prevPageBtn) {
      this.prevPageBtn.disabled = this.currentPage <= 1;
    }
    if (this.nextPageBtn) {
      this.nextPageBtn.disabled = this.currentPage >= totalPages;
    }
  }

  /**
   * 上一页
   */
  goToPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderTable();
      this.updatePagination();
    }
  }

  /**
   * 下一页
   */
  goToNextPage() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderTable();
      this.updatePagination();
    }
  }

  /**
   * 显示保存确认对话框
   */
  showSaveModal() {
    if (this.modifiedRows.size === 0) {
      notify.info('没有需要保存的更改');
      return;
    }

    if (this.modalModifiedCount) {
      this.modalModifiedCount.textContent = this.modifiedRows.size;
    }
    if (this.saveModal) {
      this.saveModal.style.display = 'flex';
    }
  }

  showModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hideModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  openAddItemModal() {
    this.renderAddProjectOptions();
    this.clearAddItemErrors();
    this.addItemForm?.reset();
    this.showModal(this.addItemModal);
  }

  openBatchAddModal() {
    this.switchBatchTab('paste');
    this.batchPasteInput && (this.batchPasteInput.value = '');
    this.updateBatchPastePreview();
    this.batchTableBody && (this.batchTableBody.innerHTML = '');
    this.addBatchInputRow();
    this.updateBatchTablePreview();
    this.showModal(this.batchAddModal);
  }

  clearAddItemErrors() {
    if (this.addProjectError) this.addProjectError.textContent = '';
    if (this.addSkuError) this.addSkuError.textContent = '';
  }

  normalizeSku(sku) {
    return (sku || '').toString().trim().toUpperCase();
  }

  hasDuplicateSku(sku) {
    const normalized = this.normalizeSku(sku);
    if (!normalized) return false;
    return this.originalData.some(row => this.normalizeSku(row.SKU) === normalized);
  }

  validateSingleItemForm() {
    this.clearAddItemErrors();
    let isValid = true;
    const sku = this.addSku?.value?.trim() || '';
    const project = this.addProject?.value || '';

    if (!project) {
      if (this.addProjectError) this.addProjectError.textContent = '请选择项目名称';
      isValid = false;
    }
    if (!sku) {
      if (this.addSkuError) this.addSkuError.textContent = 'SKU 为必填项';
      isValid = false;
    } else if (this.hasDuplicateSku(sku)) {
      if (this.addSkuError) this.addSkuError.textContent = 'SKU 已存在，不能重复';
      isValid = false;
    }
    return isValid;
  }

  buildSkuRecord({ project_name, SKU, ASIN, headTripCost, fobCost }) {
    return {
      project_name: (project_name || '').trim(),
      SKU: (SKU || '').trim(),
      ASIN: (ASIN || '').trim(),
      '头程单价': headTripCost === '' ? '0' : Number(headTripCost).toString(),
      'FOB单价': fobCost === '' ? '0' : Number(fobCost).toString()
    };
  }

  appendRecords(records, options = {}) {
    const { markModified = true } = options;
    if (!records.length) return;
    const startIndex = this.originalData.length;
    records.forEach((record, offset) => {
      this.originalData.push(record);
      if (markModified) {
        this.modifiedRows.add(startIndex + offset);
      }
      if (record.project_name) {
        this.projects.add(record.project_name);
      }
    });
    this.renderProjectFilterOptions();
    this.renderAddProjectOptions();
    this.currentPage = 1;
    this.filterData();
  }

  async createSingleItem(record) {
    const response = await fetch('/toolset/sku-cost/item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || '添加失败');
    }
    return result.data || record;
  }

  async createBatchItems(records) {
    const response = await fetch('/toolset/sku-cost/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(records)
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || '批量添加失败');
    }
    return result;
  }

  async handleSingleAdd() {
    if (!this.validateSingleItemForm()) return;

    const record = this.buildSkuRecord({
      project_name: this.addProject?.value || '',
      SKU: this.addSku?.value || '',
      ASIN: this.addAsin?.value || '',
      headTripCost: this.addHeadTripCost?.value || '',
      fobCost: this.addFobCost?.value || ''
    });

    try {
      const savedRecord = await this.createSingleItem(record);
      this.appendRecords([savedRecord], { markModified: false });
      this.hideModal(this.addItemModal);
      notify.success('添加成功，数据已保存');
    } catch (error) {
      notify.error(error.message || '添加失败');
    }
  }

  switchBatchTab(tabName) {
    this.batchTabs?.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    this.batchContents?.forEach(content => {
      content.classList.toggle('active', content.id === `batch-${tabName}-content`);
    });
  }

  parseBatchPasteText(rawText) {
    const lines = (rawText || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    return lines.map((line, index) => {
      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map(part => part.trim());
      return {
        lineNo: index + 1,
        project_name: parts[0] || '',
        SKU: parts[1] || '',
        ASIN: parts[2] || '',
        headTripCost: parts[3] || '',
        fobCost: parts[4] || ''
      };
    });
  }

  updateBatchPastePreview() {
    if (!this.batchPastePreview) return;
    const parsed = this.parseBatchPasteText(this.batchPasteInput?.value || '');
    if (!parsed.length) {
      this.batchPastePreview.innerHTML = '<span class="preview-text">等待输入...</span>';
      return;
    }
    const invalid = parsed.filter(item => !item.SKU).length;
    this.batchPastePreview.textContent = `共 ${parsed.length} 行，SKU 缺失 ${invalid} 行`;
  }

  createBatchProjectSelect() {
    const select = document.createElement('select');
    select.className = 'form-control';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '项目';
    select.appendChild(defaultOption);
    Array.from(this.projects).sort().forEach(project => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      select.appendChild(option);
    });
    return select;
  }

  addBatchInputRow() {
    if (!this.batchTableBody) return;
    const row = document.createElement('tr');

    const projectCell = document.createElement('td');
    projectCell.appendChild(this.createBatchProjectSelect());

    const skuCell = document.createElement('td');
    skuCell.innerHTML = '<input type="text" class="form-control" placeholder="SKU">';

    const asinCell = document.createElement('td');
    asinCell.innerHTML = '<input type="text" class="form-control" placeholder="ASIN">';

    const headTripCell = document.createElement('td');
    headTripCell.innerHTML = '<input type="number" class="form-control" step="0.01" min="0" placeholder="0.00">';

    const fobCell = document.createElement('td');
    fobCell.innerHTML = '<input type="number" class="form-control" step="0.01" min="0" placeholder="0.00">';

    const actionCell = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-secondary';
    removeBtn.textContent = '删除';
    removeBtn.addEventListener('click', () => {
      row.remove();
      this.updateBatchTablePreview();
    });
    actionCell.appendChild(removeBtn);

    row.appendChild(projectCell);
    row.appendChild(skuCell);
    row.appendChild(asinCell);
    row.appendChild(headTripCell);
    row.appendChild(fobCell);
    row.appendChild(actionCell);

    row.querySelectorAll('input,select').forEach(node => {
      node.addEventListener('input', () => this.updateBatchTablePreview());
      node.addEventListener('change', () => this.updateBatchTablePreview());
    });
    this.batchTableBody.appendChild(row);
    this.updateBatchTablePreview();
  }

  collectBatchTableRows() {
    if (!this.batchTableBody) return [];
    return Array.from(this.batchTableBody.querySelectorAll('tr')).map((tr, index) => {
      const cells = tr.querySelectorAll('td');
      return {
        lineNo: index + 1,
        project_name: cells[0]?.querySelector('select')?.value?.trim() || '',
        SKU: cells[1]?.querySelector('input')?.value?.trim() || '',
        ASIN: cells[2]?.querySelector('input')?.value?.trim() || '',
        headTripCost: cells[3]?.querySelector('input')?.value?.trim() || '',
        fobCost: cells[4]?.querySelector('input')?.value?.trim() || ''
      };
    }).filter(row => row.project_name || row.SKU || row.ASIN || row.headTripCost || row.fobCost);
  }

  updateBatchTablePreview() {
    if (!this.batchTablePreview) return;
    const rows = this.collectBatchTableRows();
    if (!rows.length) {
      this.batchTablePreview.innerHTML = '<span class="preview-text">等待输入...</span>';
      return;
    }
    const invalid = rows.filter(item => !item.SKU).length;
    this.batchTablePreview.textContent = `共 ${rows.length} 行，SKU 缺失 ${invalid} 行`;
  }

  normalizeBatchRecords(rawRows) {
    const errors = [];
    const candidateSkus = new Set();
    const duplicateExisting = [];
    const duplicateInBatch = [];

    rawRows.forEach(row => {
      const sku = this.normalizeSku(row.SKU);
      if (!sku) {
        errors.push(`第 ${row.lineNo} 行 SKU 为空`);
        return;
      }
      if (this.hasDuplicateSku(sku)) {
        duplicateExisting.push(`第 ${row.lineNo} 行 SKU(${sku}) 与现有数据重复`);
      }
      if (candidateSkus.has(sku)) {
        duplicateInBatch.push(`第 ${row.lineNo} 行 SKU(${sku}) 在批量数据中重复`);
      } else {
        candidateSkus.add(sku);
      }
    });

    errors.push(...duplicateExisting, ...duplicateInBatch);

    if (errors.length) {
      return { ok: false, errors };
    }

    const records = rawRows.map(row => this.buildSkuRecord({
      project_name: row.project_name,
      SKU: row.SKU,
      ASIN: row.ASIN,
      headTripCost: row.headTripCost,
      fobCost: row.fobCost
    }));
    return { ok: true, records };
  }

  async handleBatchAdd() {
    const activeTab = Array.from(this.batchTabs || []).find(tab => tab.classList.contains('active'));
    const tabName = activeTab?.dataset?.tab || 'paste';
    const rows = tabName === 'table'
      ? this.collectBatchTableRows()
      : this.parseBatchPasteText(this.batchPasteInput?.value || '');

    if (!rows.length) {
      notify.error('请先输入批量数据');
      return;
    }

    const normalized = this.normalizeBatchRecords(rows);
    if (!normalized.ok) {
      notify.error(normalized.errors.slice(0, 3).join('；'));
      return;
    }

    try {
      const result = await this.createBatchItems(normalized.records);
      const successRows = Array.isArray(result.data) ? result.data : [];

      if (successRows.length > 0) {
        this.appendRecords(successRows, { markModified: false });
      }
      this.hideModal(this.batchAddModal);

      if (result.failed_count > 0) {
        notify.info(result.message || `部分添加成功：${successRows.length} 条`);
      } else {
        notify.success(result.message || `已批量添加 ${successRows.length} 条记录`);
      }
    } catch (error) {
      notify.error(error.message || '批量添加失败');
    }
  }

  /**
   * 隐藏保存确认对话框
   */
  hideSaveModal() {
    if (this.saveModal) {
      this.saveModal.style.display = 'none';
    }
  }

  /**
   * 保存数据
   */
  async saveData() {
    this.hideSaveModal();
    this.showLoading();

    try {
      const response = await fetch('/toolset/sku-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: this.originalData
        })
      });

      const result = await response.json();

      if (result.success) {
        this.modifiedRows.clear();
        this.updateStats();
        this.renderTable();
        notify.success('数据保存成功');
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存数据失败:', error);
      notify.error('保存失败: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    // 添加加载遮罩到表格容器
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.id = 'table-loading';
      overlay.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      `;
      tableContainer.style.position = 'relative';
      tableContainer.appendChild(overlay);
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = document.getElementById('table-loading');
    if (loading) {
      loading.remove();
    }
  }
}

// 全局实例
let skuCostManagerInstance = null;

/**
 * 初始化 SKU 成本表管理器
 */
function initializeSkuCostManager() {
  if (skuCostManagerInstance) {
    skuCostManagerInstance.destroy?.();
  }
  skuCostManagerInstance = new SkuCostManager();
  return skuCostManagerInstance;
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.SkuCostManager = SkuCostManager;
  window.initializeSkuCostManager = initializeSkuCostManager;
}

// 自动初始化（如果页面包含 SKU 成本表管理容器）
document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.tool-container');
  if (container && container.querySelector('#sku-table')) {
    initializeSkuCostManager();
  }
});
