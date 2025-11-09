import { useState, useEffect } from 'react';
import { Users, BookOpen, Mail, Phone, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { parentService } from '../../services/parentService';

const MyChildrenPage = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [guardians, setGuardians] = useState([]);

  // Fetch parent's children
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await parentService.getMyChildren();
        const childrenData = response.data || [];
        setChildren(childrenData);

        // Auto-select first child
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Fetch guardians for selected child
  useEffect(() => {
    const fetchGuardians = async () => {
      if (!selectedChild) {
        setGuardians([]);
        return;
      }

      try {
        const response = await parentService.getAuthorizedGuardians(selectedChild.id);
        const guardiansData = response.data || [];
        setGuardians(guardiansData);
      } catch (error) {
        console.error('Error fetching guardians:', error);
        setGuardians([]);
      }
    };

    fetchGuardians();
  }, [selectedChild]);

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

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Миний хүүхдүүд</h1>
          <p className="text-gray-600 mt-1">Бүртгэлтэй хүүхдүүдийн мэдээлэл</p>
        </div>

        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Хүүхэд олдсонгүй
            </h3>
            <p className="text-gray-500">
              Таны бүртгэлтэй хүүхэд байхгүй байна.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Миний хүүхдүүд</h1>
        <p className="text-gray-600 mt-1">
          Бүртгэлтэй {children.length} хүүхдийн мэдээлэл
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children List */}
        <div className="lg:col-span-1">
          <Card title="Сурагчид">
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedChild?.id === child.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                      {child.firstName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {child.class?.name || 'Анги тодорхойгүй'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Child Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedChild && (
            <>
              {/* Basic Info */}
              <Card title="Үндсэн мэдээлэл">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Овог нэр</p>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedChild.lastName} {selectedChild.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Регистр</p>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedChild.registrationNumber || 'Байхгүй'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Анги
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedChild.class?.name || 'Тодорхойгүй'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Төлөв
                    </p>
                    <Badge variant="success">Идэвхтэй</Badge>
                  </div>
                </div>

                {selectedChild.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Тэмдэглэл</p>
                    <p className="text-gray-900">{selectedChild.notes}</p>
                  </div>
                )}
              </Card>

              {/* Authorized Guardians */}
              <Card title="Зөвшөөрөгдсөн авагчид">
                {guardians.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Зөвшөөрөгдсөн авагч олдсонгүй
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guardians.map((guardian) => (
                      <div
                        key={guardian.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                              {guardian.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {guardian.fullName}
                              </p>
                              <div className="mt-1 space-y-1">
                                {guardian.phoneNumber && (
                                  <p className="text-sm text-gray-600">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {guardian.phoneNumber}
                                  </p>
                                )}
                                {guardian.email && (
                                  <p className="text-sm text-gray-600">
                                    <Mail className="w-3 h-3 inline mr-1" />
                                    {guardian.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="success">Зөвшөөрөгдсөн</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyChildrenPage;
