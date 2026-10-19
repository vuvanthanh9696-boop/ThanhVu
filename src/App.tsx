/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Docket, 
  DocketStatus, 
  ActiveTab, 
  SmartNotification,
  StepStatus,
  YearlyTask
} from './types';
import { 
  loadDockets, 
  saveDockets, 
  resetToSampleData,
  loadYearlyTasks,
  saveYearlyTasks
} from './utils/storage';
import { 
  computeSmartNotifications, 
  requestNotificationPermission, 
  sendBrowserNotification 
} from './utils/notifications';
import { sound } from './utils/sound';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { DocketList } from './components/DocketList';
import { YearlyTasksView } from './components/YearlyTasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { CalendarView } from './components/CalendarView';
import { DocketFormModal } from './components/DocketFormModal';
import { DocketDetailModal } from './components/DocketDetailModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BackupModal } from './components/BackupModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { loadWorkflowTemplates, WorkflowTemplate } from './utils/templates';

export default function App() {
  const [dockets, setDockets] = useState<Docket[]>(() => loadDockets());
  const [yearlyTasks, setYearlyTasks] = useState<YearlyTask[]>(() => loadYearlyTasks());
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>(() => loadWorkflowTemplates());
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlobalTemplateManagerOpen, setIsGlobalTemplateManagerOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocket, setEditingDocket] = useState<Docket | null>(null);
  const [selectedDocket, setSelectedDocket] = useState<Docket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Notification state
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Save on state change
  useEffect(() => {
    saveDockets(dockets);
  }, [dockets]);

  useEffect(() => {
    saveYearlyTasks(yearlyTasks);
  }, [yearlyTasks]);

  // Compute smart notifications
  const rawNotifications = useMemo(() => computeSmartNotifications(dockets), [dockets]);
  const notifications: SmartNotification[] = useMemo(() => {
    return rawNotifications.map((n) => ({
      ...n,
      read: readNotifIds.has(n.id),
    }));
  }, [rawNotifications, readNotifIds]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Count items for today badge
  const todayStr = new Date().toISOString().split('T')[0];
  const nowMs = new Date(todayStr).getTime();
  const todayUrgentCount = useMemo(() => {
    let count = 0;
    dockets.forEach((d) => {
      d.steps.forEach((s) => {
        if (s.status !== 'completed' && s.dueDate) {
          const sTime = new Date(s.dueDate).getTime();
          if (sTime <= nowMs) {
            count++;
          }
        }
      });
    });
    return count;
  }, [dockets, nowMs]);

  // Handle step status toggle
  const handleToggleStepStatus = (docketId: string, stepId: string) => {
    setDockets((prev) =>
      prev.map((docket) => {
        if (docket.id !== docketId) return docket;

        const updatedSteps = docket.steps.map((st) => {
          if (st.id !== stepId) return st;
          const willBeCompleted = st.status !== 'completed';
          if (willBeCompleted) {
            sound.playSuccessChime();
            showToast(`Đã hoàn thành bước: ${st.stepCode}`);
          } else {
            sound.playSubtleClick();
          }
          return {
            ...st,
            status: (willBeCompleted ? 'completed' : 'in_progress') as StepStatus,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          };
        });

        // Recalculate parent status
        const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.status === 'completed');
        const newStatus = allDone
          ? 'completed'
          : docket.status === 'completed'
          ? 'in_progress'
          : docket.status;

        return {
          ...docket,
          steps: updatedSteps,
          status: newStatus,
          completedAt: allDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // If detail modal is open for this docket, update selectedDocket too
    if (selectedDocket && selectedDocket.id === docketId) {
      setSelectedDocket((prev) => {
        if (!prev) return null;
        const updatedSteps = prev.steps.map((st) =>
          st.id === stepId
            ? {
                ...st,
                status: (st.status === 'completed' ? 'in_progress' : 'completed') as StepStatus,
                completedAt: st.status === 'completed' ? undefined : new Date().toISOString(),
              }
            : st
        );
        return {
          ...prev,
          steps: updatedSteps,
          status: updatedSteps.every((s) => s.status === 'completed') ? 'completed' : prev.status,
        };
      });
    }
  };

  // Update docket status
  const handleUpdateDocketStatus = (docketId: string, newStatus: DocketStatus) => {
    setDockets((prev) =>
      prev.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
    showToast('Đã cập nhật trạng thái hồ sơ');
  };

  // Save new / edited docket
  const handleSaveDocket = (docketData: Docket) => {
    const isEdit = dockets.some((d) => d.id === docketData.id);

    if (isEdit) {
      setDockets((prev) => prev.map((d) => (d.id === docketData.id ? docketData : d)));
      showToast(`Đã cập nhật hồ sơ: ${docketData.code}`);
    } else {
      setDockets((prev) => [docketData, ...prev]);
      showToast(`Đã tạo mới hồ sơ: ${docketData.code}`);
    }

    setIsCreateModalOpen(false);
    setEditingDocket(null);
  };

  // Open detail modal
  const handleOpenDocketDetail = (docket: Docket) => {
    setSelectedDocket(docket);
    setIsDetailModalOpen(true);
  };

  // Open edit modal
  const handleEditDocket = (docket: Docket) => {
    setEditingDocket(docket);
    setIsCreateModalOpen(true);
    setIsDetailModalOpen(false);
  };

  // Delete docket
  const handleDeleteDocket = (docketId: string) => {
    const target = dockets.find((d) => d.id === docketId);
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ ${target?.code || ''}? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    setDockets((prev) => prev.filter((d) => d.id !== docketId));
    setIsDetailModalOpen(false);
    setSelectedDocket(null);
    showToast('Đã xóa hồ sơ khỏi hệ thống');
  };

  // Yearly Tasks Handlers
  const handleSaveYearlyTask = (task: YearlyTask) => {
    setYearlyTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [task, ...prev];
    });
    showToast(`Đã lưu nhiệm vụ năm: ${task.code}`);
  };

  const handleDeleteYearlyTask = (taskId: string) => {
    const target = yearlyTasks.find((t) => t.id === taskId);
    setYearlyTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast(`Đã xóa nhiệm vụ ${target?.code || ''}`);
  };

  // Reset sample data
  const handleResetData = () => {
    const samples = resetToSampleData();
    setDockets(samples);
    const sampleTasks = loadYearlyTasks();
    setYearlyTasks(sampleTasks);
    setReadNotifIds(new Set());
    showToast('Đã khôi phục dữ liệu mẫu thành công');
  };

  // Request browser notifications
  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification(
        'DocuFlow - Đã bật thông báo',
        'Hệ thống sẽ nhắc nhở bạn các mốc hạn công việc quan trọng.'
      );
      showToast('Đã kích hoạt thông báo nhắc việc trên trình duyệt');
    } else {
      showToast('Quyền thông báo chưa được cấp');
    }
  };

  // Notification read actions
  const handleMarkNotifAsRead = (id: string) => {
    setReadNotifIds((prev) => new Set(prev).add(id));
  };

  const handleMarkAllNotifsAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotifIds(allIds);
    showToast('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract (3 Zones) */}
      <Header
        dockets={dockets}
        notifications={notifications}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          if (val && activeTab !== 'dockets') {
            setActiveTab('dockets');
          }
        }}
        onOpenCreateModal={() => {
          setEditingDocket(null);
          setIsCreateModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        unreadNotifCount={unreadNotifCount}
      />

      {/* Main Workspace Frame (CSS selector 1) */}
      <div className="flex-1 flex overflow-hidden relative bg-[#0A0E17] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(30,58,138,0.12),rgba(10,14,23,0))]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          dockets={dockets}
          todayUrgentCount={todayUrgentCount}
          yearlyTasksCount={yearlyTasks.length}
          onResetData={handleResetData}
          onEnableNotifications={handleEnableNotifications}
          notificationPermission={notificationPermission}
          onOpenTemplateManager={() => setIsGlobalTemplateManagerOpen(true)}
          onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        />

        {/* Viewport Content Canvas (CSS selector 2) */}
        <main className="flex-1 overflow-y-auto relative w-full text-slate-100 scroll-smooth focus:outline-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">
            {activeTab === 'today' && (
              <TodayView
                dockets={dockets}
                onToggleStepStatus={handleToggleStepStatus}
                onOpenDocketDetail={handleOpenDocketDetail}
                onOpenCreateModal={() => {
                  setEditingDocket(null);
                  setIsCreateModalOpen(true);
                }}
              />
            )}

            {activeTab === 'dockets' && (
              <DocketList
                dockets={dockets}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenCreateModal={() => {
                  setEditingDocket(null);
                  setIsCreateModalOpen(true);
                }}
                onOpenDocketDetail={handleOpenDocketDetail}
                onEditDocket={handleEditDocket}
                onDeleteDocket={handleDeleteDocket}
                onToggleStepStatus={handleToggleStepStatus}
                onUpdateDocketStatus={handleUpdateDocketStatus}
              />
            )}

            {activeTab === 'yearly' && (
              <YearlyTasksView
                yearlyTasks={yearlyTasks}
                dockets={dockets}
                onSaveTask={handleSaveYearlyTask}
                onDeleteTask={handleDeleteYearlyTask}
                onOpenDocketDetail={handleOpenDocketDetail}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView 
                dockets={dockets} 
                yearlyTasks={yearlyTasks}
                onSaveYearlyTask={handleSaveYearlyTask}
                onDeleteYearlyTask={handleDeleteYearlyTask}
                onOpenDocketDetail={handleOpenDocketDetail}
                onNavigateToYearly={() => setActiveTab('yearly')}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                dockets={dockets}
                onOpenDocketDetail={handleOpenDocketDetail}
                onToggleStepStatus={handleToggleStepStatus}
              />
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal 1: Create / Edit Docket with Dynamic Steps & Duplicate Check */}
      <DocketFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDocket(null);
        }}
        onSave={handleSaveDocket}
        existingDockets={dockets}
        editingDocket={editingDocket}
      />

      {/* Modal 2: Full Docket Detail & Step Timeline */}
      <DocketDetailModal
        docket={selectedDocket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDocket(null);
        }}
        onUpdateDocket={(updated) => {
          setDockets((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setSelectedDocket(updated);
        }}
        onEditDocket={handleEditDocket}
        onDeleteDocket={handleDeleteDocket}
      />

      {/* Drawer: Smart Notifications Center */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onSelectDocket={(docketId) => {
          const matched = dockets.find((d) => d.id === docketId);
          if (matched) {
            handleOpenDocketDetail(matched);
          }
        }}
        onEnableBrowserNotifications={handleEnableNotifications}
        notificationPermission={notificationPermission}
      />

      {/* Modal 3: Data Backup, CSV Export, Restore */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        dockets={dockets}
        onImportDockets={(imported) => {
          setDockets(imported);
          showToast(`Đã nạp ${imported.length} hồ sơ thành công`);
        }}
        onResetData={handleResetData}
      />

      {/* Modal 4: Quản lý & Tùy chỉnh Mẫu Quy trình toàn hệ thống */}
      {isGlobalTemplateManagerOpen && (
        <TemplateManagerModal
          isOpen={isGlobalTemplateManagerOpen}
          onClose={() => setIsGlobalTemplateManagerOpen(false)}
          templates={workflowTemplates}
          onTemplatesChange={(newTemplates) => {
            setWorkflowTemplates(newTemplates);
            showToast('Đã lưu các thay đổi mẫu quy trình');
          }}
          onSelectTemplateToLoad={(templateId) => {
            setIsGlobalTemplateManagerOpen(false);
            setEditingDocket(null);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* Modal 5: Đồng bộ mã nguồn & dữ liệu sang GitHub */}
      {isGitHubSyncOpen && (
        <GitHubSyncModal
          isOpen={isGitHubSyncOpen}
          onClose={() => setIsGitHubSyncOpen(false)}
          onExportJson={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dockets, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `docuflow_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(dlAnchorElem);
            dlAnchorElem.click();
            document.body.removeChild(dlAnchorElem);
            showToast('Đã tải xuống tệp JSON sao lưu dữ liệu!');
          }}
        />
      )}
    </div>
  );
}
