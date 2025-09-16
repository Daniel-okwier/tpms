import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLabTests, 
  labTestsSelectors, 
  setFilters, 
  setPage, 
  deleteLabTest 
} from '../redux/slices/labTestsSlice';
import LabTestForm from './LabTestForm';
import LabTestDetail from './LabTestDetail';
import { useAuth } from '../contexts/AuthContext';

const LabTestsPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const labTests = useSelector(labTestsSelectors.selectAll);
  const loading = useSelector((state) => state.labTests.loading);
  const total = useSelector((state) => state.labTests.total);
  const page = useSelector((state) => state.labTests.page);
  const filters = useSelector((state) => state.labTests.filters);

  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    dispatch(fetchLabTests());
  }, [dispatch, page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, q: search }));
  };

  const handleView = (test) => {
    setSelectedTest(test);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setSelectedTest(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab test?')) return;
    try {
      await dispatch(deleteLabTest(id)).unwrap();
      dispatch(fetchLabTests());
    } catch (err) {
      console.error('Failed to delete lab test:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lab Tests Dashboard</h2>
        {(user.role === 'doctor' || user.role === 'nurse') && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Lab Test
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by patient or test..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 w-full"
        />
        <button
          type="submit"
          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Search
        </button>
      </form>

      {loading === 'pending' ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">Test Type</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Ordered By</th>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labTests.map((test) => (
              <tr key={test._id}>
                <td className="border px-2 py-1">{test.patient?.name}</td>
                <td className="border px-2 py-1">{test.testType}</td>
                <td className="border px-2 py-1">{test.status}</td>
                <td className="border px-2 py-1">{test.orderedBy?.name}</td>
                <td className="border px-2 py-1">
                  {new Date(test.orderDate).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1 flex gap-1">
                  <button
                    onClick={() => handleView(test)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    View
                  </button>
                  {(user.role === 'doctor' || user.role === 'lab_staff') && (
                    <button
                      onClick={() => {
                        setSelectedTest(test);
                        setShowForm(true);
                      }}
                      className="px-2 py-1 bg-yellow-300 rounded hover:bg-yellow-400"
                    >
                      Edit
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={page === 1}
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => dispatch(setPage(page + 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={page * 12 >= total}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <LabTestForm
          test={selectedTest}
          onClose={() => setShowForm(false)}
        />
      )}

      {showDetail && (
        <LabTestDetail
          test={selectedTest}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default LabTestsPage;
