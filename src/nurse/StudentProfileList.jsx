import React, { useEffect, useState, useMemo } from "react";
import { 
  Table, 
  Typography, 
  Spin, 
  Alert, 
  Card, 
  Input, 
  Select, 
  Row, 
  Col, 
  Space, 
  Button, 
  Tag, 
  Drawer, 
  Descriptions, 
  Statistic, 
  Divider, 
  Avatar, 
  Empty,
  Badge,
  Tooltip,
  Progress,
  message
} from "antd";
import { 
  TeamOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  FileTextOutlined, 
  UserOutlined,
  HeartOutlined,
  BarChartOutlined,
  EyeOutlined,
  SoundOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  HistoryOutlined,
  CalendarOutlined,
  PrinterOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import api from "../config/axios";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentProfileList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]); // Danh sách lớp từ API
  const [grades, setGrades] = useState([]); // Danh sách khối từ API
  const [classesLoading, setClassesLoading] = useState(false);

  // Lấy danh sách các lớp học từ API Student
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        // Gọi API Student để lấy thông tin học sinh cùng với thông tin lớp học
        const response = await api.get("/Student");
        
        // Log response để debug
        console.log("API Student response:", response.data);
        
        // Xử lý dữ liệu học sinh
        let studentList = [];
        if (response.data && response.data.$values) {
          studentList = response.data.$values;
        } else if (Array.isArray(response.data)) {
          studentList = response.data;
        }
        
        console.log("Processed student list:", studentList);
        
        // Trích xuất thông tin lớp học từ dữ liệu học sinh
        const classData = studentList
          .filter(student => student.classID && student.className) // Lọc những học sinh có thông tin lớp
          .reduce((acc, student) => {
            // Nếu chưa có lớp này trong danh sách, thêm vào
            if (!acc.find(cls => cls.classID === student.classID)) {
              // Trích xuất số khối từ tên lớp (ví dụ: "Lớp 1A" -> "1")
              const gradePart = student.className.split(' ')[1] || "";
              const gradeNumber = gradePart.match(/\d+/) ? gradePart.match(/\d+/)[0] : "";
              
              acc.push({
                classID: student.classID,
                className: student.className,
                grade: gradeNumber,
                schoolYear: "2023-2024" // Mặc định năm học
              });
            }
            return acc;
          }, []);
        
        console.log("Extracted class data:", classData);
        
        if (classData.length > 0) {
          setClasses(classData);
          
          // Tạo danh sách các khối học từ thông tin lớp
          const uniqueGrades = [...new Set(classData.map(cls => cls.grade))].filter(Boolean).sort();
          console.log("Unique grades:", uniqueGrades);
          
          const gradeOptions = uniqueGrades.map(grade => ({
            value: grade,
            label: `Khối ${grade}`
          }));
          
          setGrades(gradeOptions);
          
      
        } else {
          console.log("No classes found in API response, using default data");
          createDefaultClasses();
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        message.error("Không thể tải thông tin lớp học");
        createDefaultClasses();
      } finally {
        setClassesLoading(false);
      }
    };
    
    // Tạo dữ liệu lớp mặc định nếu không có API
    const createDefaultClasses = () => {
      // Tạo một số lớp học mẫu
      const defaultClasses = [
        { classID: 1, className: "Lớp 1A", grade: "1", schoolYear: "2023-2024" },
        { classID: 2, className: "Lớp 1B", grade: "1", schoolYear: "2023-2024" },
        { classID: 3, className: "Lớp 2A", grade: "2", schoolYear: "2023-2024" },
        { classID: 4, className: "Lớp 2B", grade: "2", schoolYear: "2023-2024" },
        { classID: 5, className: "Lớp 3A", grade: "3", schoolYear: "2023-2024" },
        { classID: 6, className: "Lớp 3B", grade: "3", schoolYear: "2023-2024" },
        { classID: 7, className: "Lớp 4A", grade: "4", schoolYear: "2023-2024" },
        { classID: 8, className: "Lớp 4B", grade: "4", schoolYear: "2023-2024" },
        { classID: 9, className: "Lớp 5A", grade: "5", schoolYear: "2023-2024" },
        { classID: 10, className: "Lớp 5B", grade: "5", schoolYear: "2023-2024" }
      ];
      
      setClasses(defaultClasses);
      
      // Tạo danh sách khối
      const uniqueGrades = [...new Set(defaultClasses.map(cls => cls.grade))].sort();
      const gradeOptions = uniqueGrades.map(grade => ({
        value: grade,
        label: `Khối ${grade}`
      }));
      
      setGrades(gradeOptions);
      
      console.log("Using default class data:", defaultClasses);
      message.warning("Đang sử dụng dữ liệu lớp mẫu do không thể kết nối API");
    };
    
    fetchClasses();
  }, []);

  // Lấy danh sách hồ sơ sức khỏe và kết hợp với thông tin lớp học
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu hồ sơ sức khỏe
        const healthRes = await api.get("HealthProfile");
        console.log("Health profile API response:", healthRes.data);
        
        // Lấy dữ liệu học sinh để có thông tin lớp học
        const studentRes = await api.get("Student");
        console.log("Student API response:", studentRes.data);
        
        // Xử lý danh sách hồ sơ sức khỏe
        let healthProfiles = [];
        if (healthRes.data && healthRes.data.$values) {
          healthProfiles = healthRes.data.$values;
        } else if (Array.isArray(healthRes.data)) {
          healthProfiles = healthRes.data;
        }
        
        // Xử lý danh sách học sinh
        let students = [];
        if (studentRes.data && studentRes.data.$values) {
          students = studentRes.data.$values;
        } else if (Array.isArray(studentRes.data)) {
          students = studentRes.data;
        }
        
        console.log("Processed health profiles:", healthProfiles);
        console.log("Processed students:", students);
        
        // Kết hợp thông tin học sinh và hồ sơ sức khỏe
        const enrichedProfiles = healthProfiles.map(profile => {
          // Tìm thông tin học sinh tương ứng với hồ sơ sức khỏe
          const student = students.find(s => s.studentID === profile.studentID);
          
          console.log(`Matching student for profile ${profile.healthProfileID}:`, student);
          
          // Lấy thông tin lớp học từ học sinh hoặc từ classes đã có
          let classInfo = null;
          if (student) {
            classInfo = {
              classID: student.classID,
              className: student.className
            };
          } else {
            classInfo = classes.find(cls => cls.classID === profile.classID);
          }
          
          console.log(`Class info for profile ${profile.healthProfileID}:`, classInfo);
          
          // Trích xuất số khối từ tên lớp
          let gradeNumber = "";
          if (classInfo?.className) {
            const gradePart = classInfo.className.split(' ')[1] || "";
            gradeNumber = gradePart.match(/\d+/) ? gradePart.match(/\d+/)[0] : "";
          }
          
          return {
            ...profile,
            studentID: profile.studentID || (student?.studentID || null),
            studentFullName: profile.studentFullName || (student?.fullName || ""),
            className: classInfo?.className || "Chưa phân lớp",
            classID: classInfo?.classID || null,
            grade: gradeNumber,
            bmi: calculateBMI(profile.weight, profile.height),
            nutritionStatus: calculateNutritionStatus(profile.weight, profile.height)
          };
        });
        
        console.log("Final enriched profiles:", enrichedProfiles);
        setData(enrichedProfiles);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Không thể tải danh sách hồ sơ sức khỏe học sinh!");
      } finally {
        setLoading(false);
      }
    };
    
    // Chỉ tải hồ sơ khi danh sách lớp đã được tải xong hoặc sau 2 giây
    if (classes.length > 0) {
      fetchProfiles();
    } else {
      // Nếu không có dữ liệu lớp sau 2 giây, vẫn tải hồ sơ
      const timer = setTimeout(() => {
        if (classes.length === 0) {
          console.log("No classes loaded after timeout, fetching profiles anyway");
          fetchProfiles();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [classes]);

  // Reset selected class when grade changes
  useEffect(() => {
    setSelectedClass(null);
  }, [selectedGrade]);

  // Lọc các lớp theo khối đã chọn
  const availableClasses = useMemo(() => {
    if (!selectedGrade) return [];
    
    console.log("Filtering classes by grade:", selectedGrade);
    
    // Lấy tất cả các lớp thuộc khối đã chọn
    const filteredClasses = classes.filter(cls => cls.grade === selectedGrade);
    
    console.log("Filtered classes:", filteredClasses);
    
    return filteredClasses.map(cls => ({
      value: cls.className,
      label: cls.className
    }));
  }, [selectedGrade, classes]);

  // Lọc dữ liệu theo tên học sinh, khối và lớp
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Log để debug
      console.log(`Filtering item: ${item.studentFullName}, class: ${item.className}, search: ${searchText}`);
      
      // Lọc theo tên học sinh
      const matchesSearch = !searchText || 
        item.studentFullName?.toLowerCase().includes(searchText.toLowerCase());
      
      // Lọc theo khối
      let matchesGrade = true;
      if (selectedGrade) {
        // Lấy số khối từ tên lớp (ví dụ: "Lớp 1A" -> "1")
        const gradeFromClassName = item.className?.split(' ')?.[1]?.charAt(0);
        matchesGrade = gradeFromClassName === selectedGrade;
        console.log(`Student ${item.studentFullName}, class ${item.className}, grade check: ${gradeFromClassName} === ${selectedGrade} = ${matchesGrade}`);
      }
      
      // Lọc theo lớp
      const matchesClass = !selectedClass || item.className === selectedClass;
      
      return matchesSearch && matchesGrade && matchesClass;
    });
  }, [data, searchText, selectedGrade, selectedClass]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailVisible(true);
  };

  // Function to print only the selected student's health profile
  const handlePrintProfile = () => {
    // Store current body content
    const originalContent = document.body.innerHTML;
    
    // Get the student detail content
    const profileElement = document.querySelector('.student-detail');
    
    if (profileElement) {
      // Create a styled print version
      const printContent = `
        <html>
          <head>
            <title>Hồ sơ sức khỏe - ${selectedStudent?.studentFullName || ''}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .print-header { text-align: center; margin-bottom: 20px; }
              .print-header h1 { margin-bottom: 5px; }
              .print-header p { margin-top: 0; color: #666; }
              .section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              .section h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #1890ff; }
              .info-row { display: flex; margin-bottom: 10px; }
              .info-label { font-weight: bold; width: 150px; }
              .status-good { color: #52c41a; }
              .status-warning { color: #faad14; }
              .status-danger { color: #f5222d; }
              table { width: 100%; border-collapse: collapse; }
              table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              table th { background-color: #f5f5f5; }
              .metrics-container { display: flex; gap: 20px; }
              .metric-box { flex: 1; text-align: center; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
              .metric-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
              .metric-label { font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>HỒ SƠ SỨC KHỎE HỌC SINH</h1>
              <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            
            <div class="section">
              <h2>Thông tin học sinh</h2>
              <div class="info-row">
                <div class="info-label">Họ và tên:</div>
                <div>${selectedStudent?.studentFullName || ''}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Lớp:</div>
                <div>${selectedStudent?.className || ''}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Mã học sinh:</div>
                <div>${String(selectedStudent?.healthProfileID || '').substring(0, 8) || 'N/A'}</div>
              </div>
            </div>
            
            <div class="section">
              <h2>Chỉ số sức khỏe</h2>
              <div class="metrics-container">
                <div class="metric-box">
                  <div class="metric-label">Cân nặng</div>
                  <div class="metric-value">${selectedStudent?.weight || '0'} kg</div>
                </div>
                <div class="metric-box">
                  <div class="metric-label">Chiều cao</div>
                  <div class="metric-value">${selectedStudent?.height || '0'} cm</div>
                </div>
                <div class="metric-box">
                  <div class="metric-label">BMI</div>
                  ${(() => {
                    const bmi = selectedStudent?.bmi || calculateBMI(selectedStudent?.weight, selectedStudent?.height);
                    const status = getBMIStatus(bmi);
                    let statusClass = '';
                    
                    if (status.color === '#52c41a') statusClass = 'status-good';
                    else if (status.color === '#faad14') statusClass = 'status-warning';
                    else statusClass = 'status-danger';
                    
                    return `
                      <div class="metric-value">${bmi}</div>
                      <div class="${statusClass}">${status.text}</div>
                    `;
                  })()}
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Thông tin sức khỏe</h2>
              <table>
                <tr>
                  <th>Thị lực</th>
                  <td>${selectedStudent?.visionDetails || 'Bình thường'}</td>
                </tr>
                <tr>
                  <th>Thính lực</th>
                  <td>${selectedStudent?.hearingDetails || 'Bình thường'}</td>
                </tr>
                <tr>
                  <th>Dị ứng</th>
                  <td>${selectedStudent?.allergies || 'Không có'}</td>
                </tr>
                <tr>
                  <th>Bệnh mãn tính</th>
                  <td>${selectedStudent?.chronicDiseases || 'Không có'}</td>
                </tr>
                <tr>
                  <th>Tiền sử điều trị</th>
                  <td>${selectedStudent?.treatmentHistory || 'Không có'}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
              <div style="width: 150px; text-align: center;">
                <p style="margin-bottom: 50px;">Người lập</p>
                <p style="margin-top: 0;">(Ký, ghi rõ họ tên)</p>
              </div>
              <div style="width: 150px; text-align: center;">
                <p style="margin-bottom: 50px;">Phụ huynh xác nhận</p>
                <p style="margin-top: 0;">(Ký, ghi rõ họ tên)</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Replace body content with print version
      document.body.innerHTML = printContent;
      
      // Print
      window.print();
      
      // Restore original content
      document.body.innerHTML = originalContent;
      
      // Re-initialize any event handlers or state
      // This is needed because replacing innerHTML removes all event handlers
      window.location.reload();
    }
  };

  // Kiểm tra lớp học có được chọn chưa
  const selectedClassInfo = useMemo(() => {
    if (!selectedClass || !classes) return null;
    return classes.find(cls => cls.className === selectedClass);
  }, [selectedClass, classes]);

  // Component hiển thị thông tin chi tiết lớp học
  const ClassInfoDisplay = ({ classInfo }) => {
    if (!classInfo) return null;
    
    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Lớp:</Text> {classInfo.className}
          </Col>
          <Col span={12}>
            <Text strong>Khối:</Text> {classInfo.grade}
          </Col>
          <Col span={12}>
            <Text strong>Giáo viên chủ nhiệm:</Text> {classInfo.teacherName || "Chưa phân công"}
          </Col>
          <Col span={12}>
            <Text strong>Năm học:</Text> {classInfo.schoolYear || "Hiện tại"}
          </Col>
        </Row>
      </Card>
    );
  };

  // Removed duplicate filteredData declaration - using the one defined earlier

  // Hàm hiển thị tag lớp học
  const renderClassColumn = (text, record) => {
    console.log(`Rendering class for student ${record.studentFullName}:`, text);
    
    if (!text || text === "Chưa phân lớp") {
      return (
        <Tag color="default" style={{ 
          fontSize: '13px', 
          padding: '2px 8px', 
          borderRadius: '4px',
          backgroundColor: '#f0f0f0',
          color: '#595959',
          border: '1px solid #d9d9d9'
        }}>
          Chưa phân lớp
        </Tag>
      );
    }
    
    return (
      <Tag color="blue" style={{ 
        fontSize: '13px', 
        padding: '2px 8px', 
        borderRadius: '4px',
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
        border: '1px solid #91d5ff'
      }}>
        {text}
      </Tag>
    );
  };
  
  // Cập nhật columns
  const columns = [
    {
      title: "Họ tên học sinh",
      dataIndex: "studentFullName",
      key: "studentFullName",
      sorter: (a, b) => a.studentFullName?.localeCompare(b.studentFullName),
      render: (text) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }} 
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      width: 120,
      align: "center",
      render: renderClassColumn,
      filters: [
        { text: 'Chưa phân lớp', value: 'Chưa phân lớp' },
        ...classes.map(cls => ({ text: cls.className, value: cls.className }))
      ],
      onFilter: (value, record) => record.className === value,
    },
    {
      title: "Bệnh mãn tính",
      dataIndex: "chronicDiseases",
      key: "chronicDiseases",
      render: (text) => text ? (
        <Tag color="volcano">{text}</Tag>
      ) : (
        <Text type="secondary">Không có</Text>
      ),
    },
    {
      title: "Cân nặng (kg)",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      align: "right",
      sorter: (a, b) => a.weight - b.weight,
    },
    {
      title: "Chiều cao (cm)",
      dataIndex: "height",
      key: "height",
      width: 110,
      align: "right",
      sorter: (a, b) => a.height - b.height,
    },
    {
      title: "BMI",
      key: "bmi",
      width: 100,
      render: (_, record) => {
        const bmi = record.bmi || calculateBMI(record.weight, record.height);
        const status = getBMIStatus(bmi);

        return <Tag color={status.color}>{status.text} ({bmi})</Tag>;
      },
    },
    {
      title: "Cập nhật",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      width: 120,
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString("vi-VN")}>
          <Space>
            <CalendarOutlined />
            <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
          </Space>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<FileTextOutlined />} 
          onClick={() => handleViewDetails(record)}
          size="small"
          style={{ borderRadius: '6px' }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Calculate health metrics
  const calculateBMI = (weight, height) => {
    return (weight / Math.pow(height / 100, 2)).toFixed(2);
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { text: "Gầy", color: "#faad14" };
    if (bmi >= 18.5 && bmi < 25) return { text: "Bình thường", color: "#52c41a" };
    if (bmi >= 25 && bmi < 30) return { text: "Thừa cân", color: "#fa8c16" };
    return { text: "Béo phì", color: "#f5222d" };
  };
  
  const calculateNutritionStatus = (weight, height) => {
    const bmi = weight / Math.pow(height / 100, 2);
    
    if (bmi < 16) return { status: "Suy dinh dưỡng nặng", level: 20, color: "#f5222d" };
    if (bmi < 18.5) return { status: "Suy dinh dưỡng nhẹ", level: 40, color: "#faad14" };
    if (bmi < 25) return { status: "Bình thường", level: 75, color: "#52c41a" };
    if (bmi < 30) return { status: "Thừa cân", level: 90, color: "#faad14" };
    return { status: "Béo phì", level: 100, color: "#f5222d" };
  };

  // Statistics for dashboard
  const healthStats = useMemo(() => {
    const totalStudents = data.length;
    if (totalStudents === 0) return {};
    
    const underweight = data.filter(s => parseFloat(s.bmi) < 18.5).length;
    const normal = data.filter(s => parseFloat(s.bmi) >= 18.5 && parseFloat(s.bmi) < 25).length;
    const overweight = data.filter(s => parseFloat(s.bmi) >= 25).length;
    const withChronic = data.filter(s => s.chronicDiseases).length;
    const withAllergies = data.filter(s => s.allergies).length;
    
    return {
      underweight: { 
        count: underweight,
        percent: Math.round((underweight / totalStudents) * 100)
      },
      normal: {
        count: normal,
        percent: Math.round((normal / totalStudents) * 100)
      },
      overweight: {
        count: overweight,
        percent: Math.round((overweight / totalStudents) * 100)
      },
      withChronic: {
        count: withChronic,
        percent: Math.round((withChronic / totalStudents) * 100)
      },
      withAllergies: {
        count: withAllergies,
        percent: Math.round((withAllergies / totalStudents) * 100)
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "80px 0"
        }}
      >
        <Spin tip="Đang tải danh sách..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Lỗi tải dữ liệu"
        description={error}
        showIcon
      />
    );
  }

  return (
    <div className="student-profile-container" style={{ 
      padding: '24px', 
      background: 'linear-gradient(to bottom, #f0f5ff, #f9fbff)',
      minHeight: '100vh'
    }}>
      {/* Dashboard Summary Cards */}
      <Title level={2} style={{ 
        marginBottom: '24px', 
        color: '#1e3a8a', 
        fontWeight: 700,
        fontSize: '28px'
      }}>
        <DashboardOutlined /> Quản lý hồ sơ sức khỏe học sinh
      </Title>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#0050b3' }}><TeamOutlined /> Tổng số hồ sơ</span>}
              value={data.length}
              valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#ad2102' }}><AlertOutlined /> Học sinh có bệnh mãn tính</span>}
              value={healthStats.withChronic?.count || 0}
              suffix={`/${data.length}`}
              valueStyle={{ color: '#fa541c', fontSize: '32px', fontWeight: 'bold' }}
            />
            {data.length > 0 && (
              <Progress 
                percent={healthStats.withChronic?.percent || 0} 
                showInfo={false} 
                strokeColor={{ '0%': '#fa541c', '100%': '#ff7a45' }}
                strokeWidth={8}
                style={{ marginTop: '12px' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#135200' }}><BarChartOutlined /> BMI bình thường</span>}
              value={healthStats.normal?.count || 0}
              suffix={`/${data.length}`}
              valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
            />
            {data.length > 0 && (
              <Progress 
                percent={healthStats.normal?.percent || 0} 
                showInfo={false} 
                strokeColor={{ '0%': '#52c41a', '100%': '#73d13d' }}
                strokeWidth={8}
                style={{ marginTop: '12px' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={0} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '16px', color: '#874d00' }}><HeartOutlined /> Học sinh thừa cân/béo phì</span>}
              value={healthStats.overweight?.count || 0}
              suffix={`/${data.length}`}
              valueStyle={{ color: '#fa8c16', fontSize: '32px', fontWeight: 'bold' }}
            />
            {data.length > 0 && (
              <Progress 
                percent={healthStats.overweight?.percent || 0} 
                showInfo={false} 
                strokeColor={{ '0%': '#fa8c16', '100%': '#ffa940' }}
                strokeWidth={8}
                style={{ marginTop: '12px' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        className="student-list-card"
        title={
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space size={16}>
                <DashboardOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#1890ff' }}>Danh sách hồ sơ sức khỏe học sinh</span>
              </Space>
            </Col>
          </Row>
        }
        style={{
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Hiển thị thông tin lớp học nếu có lớp được chọn */}
        {selectedClassInfo && (
          <Card 
            size="small" 
            style={{ 
              marginBottom: 24, 
              borderRadius: '12px', 
              background: 'linear-gradient(to right, #e6f7ff, #f0f9ff)',
              border: '1px solid #91d5ff'
            }}
          >
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong style={{ color: '#0050b3' }}>Lớp:</Text> 
                <Tag color="blue" style={{ marginLeft: 8, borderRadius: '12px', fontSize: '14px', padding: '0 8px' }}>
                  {classInfo.className}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong style={{ color: '#0050b3' }}>Khối:</Text> 
                <Tag color="geekblue" style={{ marginLeft: 8, borderRadius: '12px', fontSize: '14px', padding: '0 8px' }}>
                  Khối {classInfo.grade}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong style={{ color: '#0050b3' }}>Giáo viên chủ nhiệm:</Text> {classInfo.teacherName || "Chưa phân công"}
              </Col>
              <Col span={12}>
                <Text strong style={{ color: '#0050b3' }}>Năm học:</Text> {classInfo.schoolYear || "Hiện tại"}
              </Col>
            </Row>
          </Card>
        )}

        {/* Filter controls */}
        <Row gutter={20} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo tên học sinh..."
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
              style={{ 
                width: '100%', 
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Select
              placeholder="Lọc theo khối"
              allowClear
              style={{ 
                width: '100%',
                borderRadius: '12px'
              }}
              onChange={(value) => setSelectedGrade(value)}
              size="large"
              loading={classesLoading}
              suffixIcon={<FilterOutlined style={{ color: selectedGrade ? '#1890ff' : undefined }} />}
              dropdownStyle={{ borderRadius: '8px' }}
            >
              {grades.map(grade => (
                <Option key={grade.value} value={grade.value}>{grade.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Select
              placeholder="Lọc theo lớp"
              allowClear
              disabled={!selectedGrade}
              style={{ width: '100%' }}
              onChange={(value) => setSelectedClass(value)}
              size="large"
              loading={classesLoading}
              suffixIcon={<FilterOutlined style={{ color: selectedClass ? '#1890ff' : undefined }} />}
              dropdownStyle={{ borderRadius: '8px' }}
            >
              {availableClasses.map(cls => (
                <Option key={cls.value} value={cls.value}>{cls.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={24} lg={6} style={{ textAlign: 'right' }}>
            <Badge 
              count={filteredData.length} 
              overflowCount={999} 
              style={{ 
                backgroundColor: '#52c41a',
                fontSize: '14px',
                padding: '0 12px',
                height: '28px',
                borderRadius: '14px',
                lineHeight: '28px',
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)'
              }}
            >
              <Text strong style={{ fontSize: '16px' }}>Học sinh hiển thị</Text>
            </Badge>
          </Col>
        </Row>

        {/* Student list table */}
        <div className="student-table-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {filteredData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="healthProfileID"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng cộng ${total} hồ sơ`,
                style: { marginTop: '16px' },
                itemRender: (page, type, originalElement) => {
                  if (type === 'page') {
                    return (
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        fontWeight: 'bold' 
                      }}>
                        {originalElement}
                      </div>
                    );
                  }
                  return originalElement;
                }
              }}
              scroll={{ x: 'max-content' }}
              rowClassName={(record, index) => `student-table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
              size="middle"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
              onRow={(record) => ({
                onClick: () => handleViewDetails(record),
                style: { cursor: 'pointer' }
              })}
            />
          ) : (
            <Empty
              description={
                <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  Không tìm thấy học sinh phù hợp
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      {/* Student Detail Drawer */}
      <Drawer
        title={
          <Space size={12}>
            <UserOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Hồ sơ sức khỏe chi tiết</span>
          </Space>
        }
        width={720}
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        bodyStyle={{ padding: '24px', background: '#f8fafc' }}
        headerStyle={{ 
          background: 'linear-gradient(to right, #1890ff, #096dd9)',
          color: 'white',
          padding: '16px 24px',
          fontSize: '18px'
        }}
        extra={
          <Button 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrintProfile}
            style={{
              background: 'white',
              color: '#1890ff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
              fontWeight: 'bold'
            }}
          >
            In hồ sơ
          </Button>
        }
      >
        {selectedStudent && (
          <div className="student-detail">
            {/* Student basic info */}
            <Card 
              style={{ 
                marginBottom: 24, 
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: 'none',
                overflow: 'hidden'
              }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={6}>
                  <div style={{ 
                    width: 120, 
                    height: 120, 
                    background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.35)'
                  }}>
                    <UserOutlined style={{ fontSize: '54px', color: 'white' }} />
                  </div>
                </Col>
                <Col xs={24} md={18}>
                  <Title level={3} style={{ 
                    marginBottom: 16, 
                    color: '#1e3a8a',
                    fontWeight: 700
                  }}>
                    {selectedStudent.studentFullName}
                  </Title>
                  <Space size="large" wrap>
                    <Tag color="blue" style={{ 
                      fontSize: '16px', 
                      padding: '6px 12px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(24, 144, 255, 0.15)'
                    }}>
                      <span style={{ marginRight: '5px', fontWeight: 'bold' }}>Lớp:</span>
                      {selectedStudent.className || "Chưa phân lớp"}
                    </Tag>
                    <Text style={{ fontSize: '16px' }}>
                      <strong>Mã học sinh:</strong> {String(selectedStudent.healthProfileID || '').substring(0, 8) || 'N/A'}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Health metrics */}
            <Card
              title={
                <Space size={12}>
                  <BarChartOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>Chỉ số sức khỏe</span>
                </Space>
              }
              style={{ 
                marginBottom: 24, 
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: 'none'
              }}
              headStyle={{ 
                borderBottom: '2px solid #f0f0f0',
                padding: '16px 24px' 
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card 
                    style={{ 
                      background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
                      borderRadius: '12px',
                      border: 'none'
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: '#0050b3', fontWeight: 500 }}>Cân nặng</Text>}
                      value={selectedStudent.weight}
                      suffix="kg"
                      prefix={<HeartOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#0050b3', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card
                    style={{ 
                      background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
                      borderRadius: '12px',
                      border: 'none'
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: '#0050b3', fontWeight: 500 }}>Chiều cao</Text>}
                      value={selectedStudent.height}
                      suffix="cm"
                      prefix={<HeartOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#0050b3', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  {(() => {
                    const bmi = selectedStudent.bmi || calculateBMI(selectedStudent.weight, selectedStudent.height);
                    const status = getBMIStatus(bmi);
                    return (
                      <Card
                        style={{ 
                          background: `linear-gradient(135deg, ${status.color}1A, ${status.color}33)`,
                          borderRadius: '12px',
                          border: 'none'
                        }}
                      >
                        <Statistic
                          title={<Text style={{ color: status.color, fontWeight: 500 }}>BMI</Text>}
                          value={bmi}
                          prefix={<HeartOutlined style={{ color: status.color }} />}
                          suffix={
                            <Tag color={status.color} style={{ 
                              marginLeft: 8, 
                              fontWeight: 'bold',
                              fontSize: '14px',
                              padding: '0 8px',
                              borderRadius: '10px'
                            }}>
                              {status.text}
                            </Tag>
                          }
                          valueStyle={{ color: status.color, fontWeight: 'bold' }}
                        />
                      </Card>
                    );
                  })()}
                </Col>
              </Row>
              
              {/* Nutrition status visualization */}
              <Divider />
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: '16px' }}>Tình trạng dinh dưỡng</Text>
                  <Text style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: selectedStudent.nutritionStatus?.color || '#1890ff' 
                  }}>
                    {selectedStudent.nutritionStatus?.status}
                  </Text>
                </div>
                <Progress 
                  percent={selectedStudent.nutritionStatus?.level} 
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '25%': '#ffc53d',
                    '50%': '#73d13d',
                    '75%': '#ffc53d',
                    '100%': '#ff4d4f'
                  }}
                  showInfo={false}
                  strokeWidth={10}
                  style={{ height: 12 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: 8, fontWeight: 500 }}>
                  <span style={{ color: '#ff4d4f' }}>Suy dinh dưỡng</span>
                  <span style={{ color: '#52c41a' }}>Bình thường</span>
                  <span style={{ color: '#ff4d4f' }}>Béo phì</span>
                </div>
              </div>
            </Card>

            {/* Health details */}
            <Card
              title={
                <Space size={12}>
                  <MedicineBoxOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>Thông tin sức khỏe</span>
                </Space>
              }
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: 'none'
              }}
              headStyle={{ 
                borderBottom: '2px solid #f0f0f0',
                padding: '16px 24px' 
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Descriptions 
                bordered 
                column={{ xs: 1, sm: 2 }} 
                layout="vertical"
                size="middle"
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
                labelStyle={{ 
                  fontWeight: 'bold', 
                  backgroundColor: '#fafafa'
                }}
              >
                <Descriptions.Item
                  label={<Space><EyeOutlined style={{ color: '#1890ff' }} /> Thị lực</Space>}
                >
                  {selectedStudent.visionDetails || "Bình thường"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><SoundOutlined style={{ color: '#1890ff' }} /> Thính lực</Space>}
                >
                  {selectedStudent.hearingDetails || "Bình thường"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><AlertOutlined style={{ color: '#ff4d4f' }} /> Dị ứng</Space>}
                >
                  {selectedStudent.allergies ? (
                    <Tag color="red" style={{ 
                      padding: '4px 8px', 
                      fontSize: '14px',
                      borderRadius: '4px'
                    }}>
                      {selectedStudent.allergies}
                    </Tag>
                  ) : (
                    <Text type="secondary">Không có</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><MedicineBoxOutlined style={{ color: '#ff4d4f' }} /> Bệnh mãn tính</Space>}
                >
                  {selectedStudent.chronicDiseases ? (
                    <Tag color="volcano" style={{ 
                      padding: '4px 8px', 
                      fontSize: '14px',
                      borderRadius: '4px' 
                    }}>
                      {selectedStudent.chronicDiseases}
                    </Tag>
                  ) : (
                    <Text type="secondary">Không có</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><HistoryOutlined style={{ color: '#1890ff' }} /> Tiền sử điều trị</Space>}
                  span={2}
                >
                  {selectedStudent.treatmentHistory || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><CalendarOutlined style={{ color: '#1890ff' }} /> Kiểm tra sức khỏe gần nhất</Space>}
                >
                  {selectedStudent.lastCheckupDate ? (
                    <Tag color="blue" style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {new Date(selectedStudent.lastCheckupDate).toLocaleDateString("vi-VN")}
                    </Tag>
                  ) : "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Space><CalendarOutlined style={{ color: '#1890ff' }} /> Cập nhật hồ sơ</Space>}
                >
                  <Tag color="green" style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {new Date(selectedStudent.lastUpdated).toLocaleString("vi-VN")}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Drawer>

      <style jsx="true">{`
        .student-table-row:hover {
          background-color: #e6f7ff !important;
        }
        
        .even-row {
          background-color: white;
        }
        
        .odd-row {
          background-color: #fafafa;
        }
        
        .ant-table-thead > tr > th {
          background: linear-gradient(to bottom, #f0f5ff, #e6f7ff);
          color: #1890ff;
          font-weight: bold;
          border-bottom: 2px solid #91caff;
          padding: 16px;
        }
        
        .ant-drawer-content-wrapper {
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default StudentProfileList;

