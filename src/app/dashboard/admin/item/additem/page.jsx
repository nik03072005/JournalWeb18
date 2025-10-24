'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const Itemform = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Dynamic departments from API
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    type: '',
    fileUrl: '',
    subjectId: '',
    detail: {
      title: '',
      abstract: '',
      creators: [{ firstName: '', lastName: '', email: '' }],
      guides: [{ firstName: '', lastName: '', email: '' }],
      status: '',
      volume: '',
      number: '',
      pageRange: '',
      date: '',
      references: '',
      keywords: '',
      indexing: [], // Array to store selected indexing options
      journalOrPublicationTitle: '',
      issn: '',
      officialURL: '',
      doi: '',
      conference: '',
      bookName: '',
      isbn: '',
      publisher: '',
      preface: '',
      department: '',
      semester: '',
      year: '',
      university: '',
      courseName: '',
      courseCode: '',
      // Manuscript specific fields
      page: '',
      languages: '',
      description: '',
    },
  });
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/api/subjects');
        setSubjects(response.data.subjects || []);
      } catch (err) {
        setError('Failed to fetch subjects');
        toast.error('Failed to fetch subjects');
      }
    };
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    fetchSubjects();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.custom-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (formData.fileUrl) {
      toast.error('URL already provided. Remove it to upload a file.');
      return;
    }

    if (selectedFile.type !== 'application/pdf' && !['Manuscript', 'Magazine', 'Newspaper'].includes(formData.type)) {
      toast.error('Please select a PDF file');
      return;
    }

    setFile(selectedFile);
    setFileLoading(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.url) {
        setFormData({ ...formData, fileUrl: response.data.url });
        toast.success(`File "${selectedFile.name}" uploaded successfully!`);
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      setFile(null);
    } finally {
      setFileLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFormData({ ...formData, fileUrl: '' });
    toast.success('File removed');
  };

  const handleUrlChange = (e) => {
    if (file) {
      toast.error('File already uploaded. Remove it to enter a URL.');
      return;
    }
    setFormData({ ...formData, fileUrl: e.target.value });
  };

  const handleDepartmentSelect = (departmentName) => {
    setFormData({
      ...formData,
      detail: { ...formData.detail, department: departmentName },
    });
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e, field, index) => {
    const { name, value } = e.target;
    if (field === 'creators' || field === 'guides') {
      setFormData({
        ...formData,
        detail: {
          ...formData.detail,
          [field]: formData.detail[field].map((item, i) =>
            i === index ? { ...item, [name]: value } : item
          ),
        },
      });
    } else if (field === 'detail') {
      setFormData({
        ...formData,
        detail: { ...formData.detail, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle indexing checkbox changes
  const handleIndexingChange = (option, checked) => {
    setFormData(prevState => {
      const currentIndexing = prevState.detail.indexing || [];
      let newIndexing;
      
      if (checked) {
        // Add option if checked and not already present
        newIndexing = currentIndexing.includes(option) 
          ? currentIndexing 
          : [...currentIndexing, option];
      } else {
        // Remove option if unchecked
        newIndexing = currentIndexing.filter(item => item !== option);
      }
      
      return {
        ...prevState,
        detail: {
          ...prevState.detail,
          indexing: newIndexing
        }
      };
    });
  };

  const addCreator = () => {
    setFormData({
      ...formData,
      detail: {
        ...formData.detail,
        creators: [...formData.detail.creators, { firstName: '', lastName: '', email: '' }],
      },
    });
  };

  const addGuide = () => {
    setFormData({
      ...formData,
      detail: {
        ...formData.detail,
        guides: [...formData.detail.guides, { firstName: '', lastName: '', email: '' }],
      },
    });
  };

  const removeCreator = (index) => {
    if (formData.detail.creators.length > 1) {
      setFormData({
        ...formData,
        detail: {
          ...formData.detail,
          creators: formData.detail.creators.filter((_, i) => i !== index),
        },
      });
      toast.success('Creator removed');
    } else {
      toast.error('At least one creator is required');
    }
  };

  const removeGuide = (index) => {
    if (formData.detail.guides.length > 1) {
      setFormData({
        ...formData,
        detail: {
          ...formData.detail,
          guides: formData.detail.guides.filter((_, i) => i !== index),
        },
      });
      toast.success('Guide removed');
    } else {
      toast.error('At least one guide is required');
    }
  };

  const handleSubmit = async () => {
    setFileLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/journal', {
        type: formData.type,
        fileUrl: formData.fileUrl,
        subjectId: formData.subjectId,
        detail: formData.detail,
      });

      console.log("Created item:", response.data);
      setFormData({
        type: '',
        fileUrl: '',
        subjectId: '',
        detail: {
          title: '',
          abstract: '',
          creators: [{ firstName: '', lastName: '', email: '' }],
          guides: [{ firstName: '', lastName: '', email: '' }],
          status: '',
          volume: '',
          number: '',
          pageRange: '',
          date: '',
          references: '',
          keywords: '',
          journalOrPublicationTitle: '',
          issn: '',
          officialURL: '',
          doi: '',
          conference: '',
          bookName: '',
          isbn: '',
          publisher: '',
          preface: '',
          department: '',
          semester: '',
          year: '',
          university: '',
          courseName: '',
          courseCode: '',
          page: '',
          languages: '',
          description: '',
        },
      });
      setFile(null);
      setStep(1);
      router.push('/dashboard/admin');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit item';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFileLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.type.trim() !== '';
      case 2:
        return formData.fileUrl.trim() !== '';
      case 3:
        return (
          formData.detail.title.trim() !== '' &&
          (formData.type !== 'Question Papers'
            ? formData.detail.creators.every((creator) => creator.firstName.trim() !== '')
            : true) &&
          (formData.type === 'Dissertation'
            ? formData.detail.abstract.trim() !== ''
            : true) &&
          (formData.type === 'Conference Proceeding'
            ? formData.detail.status.trim() !== '' &&
              formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Book'
            ? formData.detail.status.trim() !== '' &&
              formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Book Chapters'
            ? formData.detail.status.trim() !== '' &&
              formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Question Papers'
            ? formData.detail.department.trim() !== '' &&
              formData.detail.year.trim() !== ''
            : true) &&
          (formData.type === 'Research Papers'
            ? formData.detail.status.trim() !== '' &&
              formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Thesis'
            ? formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Dissertation'
            ? formData.detail.date.trim() !== ''
            : true) &&
          (formData.type === 'Manuscript'
            ? formData.detail.title.trim() !== '' &&
              formData.detail.date.trim() !== '' &&
              formData.detail.creators.every((creator) => creator.firstName.trim() !== '')
            : true) &&
          (formData.type === 'Magazine'
            ? formData.detail.title.trim() !== '' &&
              formData.detail.date.trim() !== '' &&
              formData.detail.languages.trim() !== '' &&
              formData.detail.creators.every((creator) => creator.firstName.trim() !== '')
            : true) &&
          (formData.type === 'Newspaper'
            ? formData.detail.title.trim() !== '' &&
              formData.detail.date.trim() !== '' &&
              formData.detail.languages.trim() !== '' &&
              formData.detail.newspaperName.trim() !== '' &&
              formData.detail.creators.every((creator) => creator.firstName.trim() !== '')
            : true)
        );
      case 4:
        return formData.subjectId.trim() !== '';
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Step 1: Select Type</h2>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="Conference Proceeding">Conference Proceeding</option>
              <option value="Book">Book</option>
              <option value="Book Chapters">Book Chapters</option>
              <option value="Magazine">Magazine</option>
              <option value="Manuscript">Manuscript</option>
              <option value="Newspaper">Newspaper</option>
              <option value="Question Papers">Question Papers</option>
              <option value="Research Papers">Research Papers</option>
              <option value="Thesis">Thesis</option>
              <option value="Dissertation">Dissertation</option>
            </select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Step 2: Provide File or URL</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  {['Manuscript', 'Magazine', 'Newspaper'].includes(formData.type) ? 'Upload File (All formats accepted)' : 'Upload PDF File'}
                </label>
                <input
                  type="file"
                  id="file"
                  accept={['Manuscript', 'Magazine', 'Newspaper'].includes(formData.type) ? '*/*' : 'application/pdf'}
                  onChange={handleFileChange}
                  disabled={formData.fileUrl && !file}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <button
                    onClick={removeFile}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <div>
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">
                  Or Enter File URL
                </label>
                <input
                  type="text"
                  id="fileUrl"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleUrlChange}
                  placeholder="Enter file URL (e.g., https://example.com/document.pdf)"
                  disabled={file}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              {fileLoading && <Loader2 className="animate-spin" size={20} />}
              {formData.fileUrl && !fileLoading && (
                <p className="text-sm text-green-500">
                  File URL: <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">View File</a>
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Step 3: Enter Details</h2>
            
            {/* Title field - full width */}
            <div className="w-full">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.detail.title}
                onChange={(e) => handleInputChange(e, 'detail')}
                placeholder="Enter title"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 2-column grid layout for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {['Conference Proceeding', 'Book', 'Book Chapters', 'Research Papers', 'Thesis', 'Dissertation', 'Magazine', 'Manuscript', 'Newspaper'].includes(formData.type) && (
                  <div>
                    <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
                      {['Magazine', 'Newspaper'].includes(formData.type) ? 'Description' : 'Abstract'} {formData.type === 'Dissertation' ? '*' : ''}
                    </label>
                    <textarea
                      id="abstract"
                      name="abstract"
                      value={formData.detail.abstract}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder={['Magazine', 'Newspaper'].includes(formData.type) ? 'Enter description' : 'Enter abstract'}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                      required={formData.type === 'Dissertation'}
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book', 'Book Chapters', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                      Volume
                    </label>
                    <input
                      type="number"
                      id="volume"
                      name="volume"
                      value={formData.detail.volume}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Volume"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                      Number
                    </label>
                    <input
                      type="number"
                      id="number"
                      name="number"
                      value={formData.detail.number}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Number"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers', 'Thesis', 'Dissertation'].includes(formData.type) && (
                  <div>
                    <label htmlFor="pageRange" className="block text-sm font-medium text-gray-700 mb-2">
                      Page Range
                    </label>
                    <input
                      type="text"
                      id="pageRange"
                      name="pageRange"
                      value={formData.detail.pageRange}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Page Range (e.g., 1-10)"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.detail.status}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="In Press">In Press</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers', 'Thesis', 'Dissertation', 'Magazine', 'Manuscript', 'Newspaper'].includes(formData.type) && (
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.detail.date}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                {formData.type === 'Conference Proceeding' && (
                  <div>
                    <label htmlFor="conference" className="block text-sm font-medium text-gray-700 mb-2">
                      Conference
                    </label>
                    <input
                      type="text"
                      id="conference"
                      name="conference"
                      value={formData.detail.conference}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Conference"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {formData.type === 'Question Papers' && (
                  <div className="relative custom-dropdown">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <div
                      id="department"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex justify-between items-center"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className={formData.detail.department ? 'text-black' : 'text-gray-500'}>
                        {formData.detail.department || 'Select Department'}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {departments.map((dept) => (
                          <div
                            key={dept.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                            onClick={() => handleDepartmentSelect(dept.departmentName)}
                          >
                            {dept.departmentName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {formData.type === 'Question Papers' && (
                  <>
                    <div>
                      <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name
                      </label>
                      <input
                        type="text"
                        id="courseName"
                        name="courseName"
                        value={formData.detail.courseName}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Course Name"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Code
                      </label>
                      <input
                        type="text"
                        id="courseCode"
                        name="courseCode"
                        value={formData.detail.courseCode}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Course Code"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                {['Question Papers', 'Thesis', 'Dissertation'].includes(formData.type) && (
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      value={formData.detail.university}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="University"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {['Conference Proceeding', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="journalOrPublicationTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Journal or Publication Title
                    </label>
                    <input
                      type="text"
                      id="journalOrPublicationTitle"
                      name="journalOrPublicationTitle"
                      value={formData.detail.journalOrPublicationTitle}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Journal or Publication Title"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="issn" className="block text-sm font-medium text-gray-700 mb-2">
                      ISSN
                    </label>
                    <input
                      type="text"
                      id="issn"
                      name="issn"
                      value={formData.detail.issn}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="ISSN"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Book Chapters', 'Book'].includes(formData.type) && (
                  <div>
                    <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.type === 'Book' ? 'Subtitle' : 'Book Name'}
                    </label>
                    <input
                      type="text"
                      id="bookName"
                      name="bookName"
                      value={formData.detail.bookName}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder={formData.type === 'Book' ? 'Subtitle' : 'Book Name'}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Book Chapters', 'Book'].includes(formData.type) && (
                  <div>
                    <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN
                    </label>
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.detail.isbn}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="ISBN"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Book Chapters', 'Book', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      id="publisher"
                      name="publisher"
                      value={formData.detail.publisher}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Publisher"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {formData.type === 'Book' && (
                  <div>
                    <label htmlFor="preface" className="block text-sm font-medium text-gray-700 mb-2">
                      Preface
                    </label>
                    <input
                      type="text"
                      id="preface"
                      name="preface"
                      value={formData.detail.preface}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Preface"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {formData.type === 'Question Papers' && (
                  <>
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <input
                        type="text"
                        id="semester"
                        name="semester"
                        value={formData.detail.semester}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Semester"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="text"
                        id="year"
                        name="year"
                        value={formData.detail.year}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Year"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="officialURL" className="block text-sm font-medium text-gray-700 mb-2">
                      Official URL
                    </label>
                    <input
                      type="text"
                      id="officialURL"
                      name="officialURL"
                      value={formData.detail.officialURL}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Official URL"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
                      DOI
                    </label>
                    <input
                      type="text"
                      id="doi"
                      name="doi"
                      value={formData.detail.doi}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="DOI"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Research Papers'].includes(formData.type) && (
                  <div>
                    <label htmlFor="references" className="block text-sm font-medium text-gray-700 mb-2">
                      References
                    </label>
                    <textarea
                      id="references"
                      name="references"
                      value={formData.detail.references}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="References"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                    />
                  </div>
                )}
                {['Conference Proceeding', 'Book Chapters', 'Book', 'Question Papers', 'Research Papers', 'Thesis', 'Dissertation', 'Magazine', 'Manuscript', 'Newspaper'].includes(formData.type) && (
                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      id="keywords"
                      name="keywords"
                      value={formData.detail.keywords}
                      onChange={(e) => handleInputChange(e, 'detail')}
                      placeholder="Keywords (comma-separated)"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {/* Indexing Checkboxes */}
                {['Research Papers', 'Conference Proceeding', 'Book', 'Book Chapters'].includes(formData.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Indexing
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Scopus', 'Web of Science', 'UGC', 'Peer Reviewed'].map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.detail.indexing || []).includes(option)}
                            onChange={(e) => handleIndexingChange(option, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {formData.type === 'Manuscript' && (
                  <>
                    <div>
                      <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-2">
                        Page
                      </label>
                      <input
                        type="text"
                        id="page"
                        name="page"
                        value={formData.detail.page}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter page number/range"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                        Language(s)
                      </label>
                      <input
                        type="text"
                        id="languages"
                        name="languages"
                        value={formData.detail.languages}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter language(s)"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.detail.description}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter description"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                      />
                    </div>
                  </>
                )}
                {formData.type === 'Magazine' && (
                  <>
                    <div>
                      <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="languages"
                        name="languages"
                        value={formData.detail.languages}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter language"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        id="publisher"
                        name="publisher"
                        value={formData.detail.publisher}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter publisher name"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="issn" className="block text-sm font-medium text-gray-700 mb-2">
                        ISSN
                      </label>
                      <input
                        type="text"
                        id="issn"
                        name="issn"
                        value={formData.detail.issn}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter ISSN"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                {formData.type === 'Newspaper' && (
                  <>
                    <div>
                      <label htmlFor="newspaperName" className="block text-sm font-medium text-gray-700 mb-2">
                        Newspaper Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newspaperName"
                        name="newspaperName"
                        value={formData.detail.newspaperName}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter newspaper name"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="languages"
                        name="languages"
                        value={formData.detail.languages}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter language"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        id="publisher"
                        name="publisher"
                        value={formData.detail.publisher}
                        onChange={(e) => handleInputChange(e, 'detail')}
                        placeholder="Enter publisher name"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            {formData.type !== 'Question Papers' && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold">{['Magazine', 'Newspaper'].includes(formData.type) ? 'Creator' : 'Creators'}</h3>
                {formData.detail.creators.map((creator, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 border p-4 rounded items-center">
                    <input
                      type="text"
                      name="firstName"
                      value={creator.firstName}
                      onChange={(e) => handleInputChange(e, 'creators', index)}
                      placeholder="First Name"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={creator.lastName}
                      onChange={(e) => handleInputChange(e, 'creators', index)}
                      placeholder="Last Name"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      value={creator.email}
                      onChange={(e) => handleInputChange(e, 'creators', index)}
                      placeholder="Email"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.detail.creators.length > 1 && (
                      <button
                        onClick={() => removeCreator(index)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCreator}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={20} /> Add Creator
                </button>
              </div>
            )}
            {['Thesis', 'Dissertation'].includes(formData.type) && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold">Guides</h3>
                {formData.detail.guides.map((guide, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 border p-4 rounded items-center">
                    <input
                      type="text"
                      name="firstName"
                      value={guide.firstName}
                      onChange={(e) => handleInputChange(e, 'guides', index)}
                      placeholder="First Name"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={guide.lastName}
                      onChange={(e) => handleInputChange(e, 'guides', index)}
                      placeholder="Last Name"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      value={guide.email}
                      onChange={(e) => handleInputChange(e, 'guides', index)}
                      placeholder="Email"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.detail.guides.length > 1 && (
                      <button
                        onClick={() => removeGuide(index)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addGuide}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={20} /> Add Guide
                </button>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Step 4: Select Subject</h2>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Step 5: Review and Submit</h2>
            <p>Please review your information before submitting.</p>
            <button
              onClick={handleSubmit}
              disabled={fileLoading}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2 cursor-pointer"
            >
              {fileLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit Item
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <style jsx>{`
        select {
          appearance: menulist !important;
          -webkit-appearance: menulist !important;
          -moz-appearance: menulist !important;
        }
        select option {
          direction: ltr;
        }
        select:focus {
          outline: none;
        }
        .department-select-container {
          overflow: visible !important;
          z-index: 1000 !important;
          position: relative !important;
        }
        .department-select-container select {
          z-index: 1001 !important;
          position: relative !important;
        }
      `}</style>
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Item</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Step {step} of 5</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>
      {renderStep()}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2 cursor-pointer"
          >
            Previous
          </button>
        )}
        {step < 5 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2 cursor-pointer"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Itemform;