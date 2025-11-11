import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';
import ReportCard from '../../components/reports/ReportCard';
import DailyReport from '../../components/reports/DailyReport';
import MonthlyReport from '../../components/reports/MonthlyReport';
import StudentHistoryReport from '../../components/reports/StudentHistoryReport';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const ReportsPage = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReportTypes();
      const types = response.data || response.reportTypes || response;
      setReportTypes(Array.isArray(types) ? types : []);
    } catch (error) {
      console.error('Error fetching report types:', error);
      toast.error('Тайлангийн төрлүүдийг татахад алдаа гарлаа');
      setReportTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport.id) {
      case 'daily':
        return <DailyReport />;
      case 'monthly':
        return <MonthlyReport />;
      case 'student':
        return <StudentHistoryReport />;
      default:
        return (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Тайлан боловсруулж байна...</p>
            </div>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тайлан ба дүн шинжилгээ</h1>
          <p className="text-gray-600 mt-1">Системийн үйл ажиллагааны тайлан үзэх</p>
        </div>
        {selectedReport && (
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Button>
        )}
      </div>

      {/* Report Selection or Report Content */}
      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => handleSelectReport(report)}
            />
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{selectedReport.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedReport.description}</p>
          </div>
          {renderReportContent()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
