import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, UserMinus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const MemberManagementModal = ({ projectId, members, onClose, onSuccess }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchEmail.length > 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchEmail]);

  const searchUsers = async () => {
    try {
      setIsSearching(true);
      const res = await api.get(`/users/search?email=${searchEmail}`);
      setSearchResults(res.data);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setIsUpdating(true);
      await api.post(`/projects/${projectId}/members`, { userIds: [userId] });
      toast.success('Member added');
      onSuccess();
      setSearchEmail(''); // Reset search after adding
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setIsUpdating(true);
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Manage Project Members
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Search user by email to add..."
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ul className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto divide-y divide-gray-200 bg-white shadow-sm">
                  {searchResults.map((user) => {
                    const isAlreadyMember = members.some((m) => m.userId === user.id);
                    return (
                      <li key={user.id} className="px-3 py-2 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          disabled={isAlreadyMember || isUpdating}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-50 p-1.5 rounded-md"
                          title={isAlreadyMember ? "Already a member" : "Add to project"}
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Current Members */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Current Members ({members.length})</h4>
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {members.map((member) => (
                  <li key={member.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {members.length === 0 && (
                  <p className="text-sm text-gray-500 py-2">No members added yet.</p>
                )}
              </ul>
            </div>

          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementModal;
