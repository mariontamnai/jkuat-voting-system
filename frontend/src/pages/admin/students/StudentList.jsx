import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  getStudents,
  updateStudent,
  deleteStudent,
} from "../../../services/adminService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = `
  w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none
  placeholder-gray-300 focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
  transition-all duration-150
`;

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    year: "",
    course: "",
    resetPassword: "",
  });

  const studentsPerPage = 10;

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudents();
    if (result.success) setStudents(result.students);
    setLoading(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleEditStudent = async (studentId) => {
    if (!editForm.name) {
      showMessage("Please enter a name", "error");
      return;
    }
    if (editForm.email && !emailRegex.test(editForm.email)) {
      showMessage("Please enter a valid email", "error");
      return;
    }
    const updateData = {
      name: editForm.name,
      email: editForm.email,
      year: editForm.year,
      course: editForm.course,
    };
    if (editForm.resetPassword) {
      updateData.password = editForm.resetPassword;
      updateData.isFirstLogin = true;
    }
    const result = await updateStudent(studentId, updateData);
    if (result.success) {
      showMessage("Student updated successfully!", "success");
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updateData } : s)),
      );
      setEditingStudent(null);
      setEditForm({
        name: "",
        email: "",
        year: "",
        course: "",
        resetPassword: "",
      });
    } else {
      showMessage("Failed to update student", "error");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await deleteStudent(studentId);
    if (result.success) {
      showMessage("Student deleted successfully!", "success");
      await loadStudents();
      setShowDeleteConfirm(null);
    } else {
      showMessage(result.message || "Failed to delete student", "error");
    }
  };

  const handleResetPassword = async (student) => {
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    const result = await updateStudent(student.id, {
      password: tempPassword,
      isFirstLogin: true,
    });
    if (result.success) {
      showMessage(`Password reset. Temp password: ${tempPassword}`, "success");
      setShowResetConfirm(null);
    } else {
      showMessage("Failed to reset password", "error");
    }
  };

  const filteredStudents = students
    .filter((s) => {
      if (filter === "voted") return s.hasVoted === true;
      if (filter === "notVoted") return s.hasVoted === false;
      return true;
    })
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage,
  );

  const votedCount = students.filter((s) => s.hasVoted).length;
  const notVotedCount = students.filter((s) => !s.hasVoted).length;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#e8f0e8]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, #c5dbc5 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 90% 80%, #d0e8d0 0%, transparent 60%)
        `,
      }}
    >
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl border border-green-100 overflow-hidden">
          {/* ── Top banner ── */}
          <div className="bg-gradient-to-br from-[#1a3a1a] to-[#2d6a2d] px-8 pt-8 pb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white/70
                                 border border-white/20 text-[0.6rem] font-black
                                 tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                >
                  👤 Admin Panel
                </span>
                <h2 className="text-white text-2xl font-black tracking-tight">
                  Registered Students
                </h2>
                <p className="text-white/60 text-xs font-light mt-1">
                  {students.length} students registered
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="shrink-0 mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                           text-white text-xs font-bold tracking-widest uppercase
                           hover:bg-white/20 transition-colors cursor-pointer"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="px-6 py-7 md:px-8">
            {/* ── Message alert ── */}
            {message && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                               font-semibold mb-5 border
                               ${
                                 messageType === "success"
                                   ? "bg-green-50 border-green-200 text-green-700"
                                   : "bg-red-50 border-red-200 text-red-700"
                               }`}
              >
                <span>{messageType === "success" ? "✅" : "⚠️"}</span>
                <span>{message}</span>
              </div>
            )}

            {/* ── Stats row ── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: "Total",
                  value: students.length,
                  icon: "👥",
                  cls: "bg-gray-50 border-gray-100 text-gray-700",
                },
                {
                  label: "Voted",
                  value: votedCount,
                  icon: "✅",
                  cls: "bg-green-50 border-green-100 text-green-700",
                },
                {
                  label: "Not Voted",
                  value: notVotedCount,
                  icon: "⏳",
                  cls: "bg-amber-50 border-amber-100 text-amber-700",
                },
              ].map(({ label, value, icon, cls }) => (
                <div
                  key={label}
                  className={`rounded-xl border px-3 py-3.5 text-center ${cls}`}
                >
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-xl font-black leading-none">{value}</div>
                  <div className="text-[0.6rem] font-bold tracking-widest uppercase mt-1 opacity-70">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Search + filter tabs ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by name or reg number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ backgroundColor: "white", color: "#1a3a1a" }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200
                             text-sm outline-none placeholder-gray-300
                             focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15
                             transition-all duration-150"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1.5 bg-gray-50 border border-gray-100 rounded-lg p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "voted", label: "✅ Voted" },
                  { key: "notVoted", label: "⏳ Not Voted" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilter(key);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide
                                transition-all duration-150 cursor-pointer
                                ${
                                  filter === key
                                    ? "bg-[#1a3a1a] text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            {!loading && (
              <p className="text-xs text-gray-400 mb-4">
                Showing{" "}
                <span className="font-bold text-[#1a3a1a]">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#1a3a1a]">
                  {students.length}
                </span>{" "}
                students
              </p>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-[#2d6a2d]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <p className="text-sm text-gray-400 font-medium">
                  Loading students...
                </p>
              </div>
            )}

            {/* ── Table ── */}
            {!loading && (
              <>
                {paginatedStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-2">
                    <span className="text-4xl">🔍</span>
                    <p className="text-sm font-bold text-gray-400">
                      No students found
                    </p>
                    <p className="text-xs text-gray-300">
                      Try adjusting your search or filter
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Table header */}
                    <div
                      className="hidden md:grid grid-cols-[2fr_1.5fr_0.5fr_0.7fr_auto]
                                    gap-3 px-4 py-2"
                    >
                      {["Name", "Reg No", "Year", "Status", "Actions"].map(
                        (h) => (
                          <span
                            key={h}
                            className="text-[0.6rem] font-black text-gray-400
                                                  tracking-widest uppercase"
                          >
                            {h}
                          </span>
                        ),
                      )}
                    </div>

                    {paginatedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5
                                   hover:bg-white hover:shadow-sm transition-all duration-150"
                      >
                        {/* ── Normal row ── */}
                        {editingStudent !== student.id &&
                          showDeleteConfirm !== student.id &&
                          showResetConfirm !== student.id && (
                            <div
                              className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_0.5fr_0.7fr_auto]
                                          gap-3 items-center"
                            >
                              <div>
                                <p className="text-sm font-black text-[#1a3a1a]">
                                  {student.name}
                                </p>
                                {student.email && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {student.email}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs font-mono text-gray-500">
                                {student.regNo}
                              </p>
                              <p className="text-xs text-gray-500">
                                Yr {student.year || "—"}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5
                                             rounded-full text-[0.6rem] font-black
                                             tracking-widest uppercase w-fit
                                             ${
                                               student.hasVoted
                                                 ? "bg-green-100 text-green-700 border border-green-200"
                                                 : "bg-amber-100 text-amber-700 border border-amber-200"
                                             }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full
                                               ${student.hasVoted ? "bg-green-500" : "bg-amber-400"}`}
                                />
                                {student.hasVoted ? "Voted" : "Pending"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingStudent(student.id);
                                    setEditForm({
                                      name: student.name,
                                      email: student.email || "",
                                      year: student.year || "",
                                      course: student.course || "",
                                      resetPassword: "",
                                    });
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200
                                           text-xs font-bold text-[#2d6a2d] hover:bg-green-50
                                           hover:border-[#2d6a2d]/30 transition-colors cursor-pointer"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setShowResetConfirm(student.id)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200
                                           text-xs font-bold text-blue-600 hover:bg-blue-50
                                           hover:border-blue-200 transition-colors cursor-pointer"
                                >
                                  🔑 Reset
                                </button>
                                <button
                                  onClick={() =>
                                    setShowDeleteConfirm(student.id)
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200
                                           text-xs font-bold text-red-500 hover:bg-red-50
                                           hover:border-red-200 transition-colors cursor-pointer"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          )}

                        {/* ── Edit mode ── */}
                        {editingStudent === student.id && (
                          <div className="space-y-3">
                            <p
                              className="text-xs font-black text-[#2d6a2d] tracking-widest
                                          uppercase mb-2"
                            >
                              ✏️ Editing: {student.regNo}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label
                                  className="block text-[0.6rem] font-bold text-gray-400
                                                  tracking-widest uppercase mb-1"
                                >
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Full name"
                                  style={{
                                    backgroundColor: "white",
                                    color: "#1a3a1a",
                                  }}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-[0.6rem] font-bold text-gray-400
                                                  tracking-widest uppercase mb-1"
                                >
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      email: e.target.value,
                                    })
                                  }
                                  placeholder="Email address"
                                  style={{
                                    backgroundColor: "white",
                                    color: "#1a3a1a",
                                  }}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-[0.6rem] font-bold text-gray-400
                                                  tracking-widest uppercase mb-1"
                                >
                                  Year
                                </label>
                                <input
                                  type="text"
                                  value={editForm.year}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      year: e.target.value,
                                    })
                                  }
                                  placeholder="Year of study"
                                  style={{
                                    backgroundColor: "white",
                                    color: "#1a3a1a",
                                  }}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-[0.6rem] font-bold text-gray-400
                                                  tracking-widest uppercase mb-1"
                                >
                                  New Password{" "}
                                  <span className="text-gray-300">
                                    (optional)
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={editForm.resetPassword}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      resetPassword: e.target.value,
                                    })
                                  }
                                  placeholder="Leave blank to keep current"
                                  style={{
                                    backgroundColor: "white",
                                    color: "#1a3a1a",
                                  }}
                                  className={inputClass}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleEditStudent(student.id)}
                                className="px-4 py-2 rounded-lg bg-[#1a3a1a] hover:bg-[#152e15]
                                           text-white text-xs font-black tracking-widest uppercase
                                           cursor-pointer transition-colors"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStudent(null);
                                  setEditForm({
                                    name: "",
                                    email: "",
                                    year: "",
                                    course: "",
                                    resetPassword: "",
                                  });
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-200
                                           text-gray-500 text-xs font-black tracking-widest uppercase
                                           hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Delete confirm ── */}
                        {showDeleteConfirm === student.id && (
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🗑️</span>
                              <div>
                                <p className="text-sm font-black text-red-600">
                                  Delete {student.name}?
                                </p>
                                <p className="text-xs text-gray-400">
                                  This action cannot be undone
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700
                                           text-white text-xs font-black tracking-widest uppercase
                                           cursor-pointer transition-colors"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 rounded-lg border border-gray-200
                                           text-gray-500 text-xs font-black tracking-widest uppercase
                                           hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Reset confirm ── */}
                        {showResetConfirm === student.id && (
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🔑</span>
                              <div>
                                <p className="text-sm font-black text-blue-700">
                                  Reset password for {student.name}?
                                </p>
                                <p className="text-xs text-gray-400">
                                  A temporary password will be generated
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResetPassword(student)}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                                           text-white text-xs font-black tracking-widest uppercase
                                           cursor-pointer transition-colors"
                              >
                                Confirm Reset
                              </button>
                              <button
                                onClick={() => setShowResetConfirm(null)}
                                className="px-4 py-2 rounded-lg border border-gray-200
                                           text-gray-500 text-xs font-black tracking-widest uppercase
                                           hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div
                    className="flex items-center justify-between mt-6 pt-5
                                  border-t border-gray-100"
                  >
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200
                                 text-xs font-black text-gray-500 tracking-widest uppercase
                                 hover:bg-gray-50 transition-colors cursor-pointer
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1,
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span
                              key={`ellipsis-${i}`}
                              className="text-xs text-gray-300 px-1"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-black
                                          transition-colors cursor-pointer
                                          ${
                                            currentPage === p
                                              ? "bg-[#1a3a1a] text-white"
                                              : "text-gray-400 hover:bg-gray-50"
                                          }`}
                            >
                              {p}
                            </button>
                          ),
                        )}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200
                                 text-xs font-black text-gray-500 tracking-widest uppercase
                                 hover:bg-gray-50 transition-colors cursor-pointer
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentList;
