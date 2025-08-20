import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [isWiping, setIsWiping] = useState(false);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    setIsWiping(true);
    for (const file of files) {
      await fs.delete(file.path);
    }
    await kv.flush();// Clear the KV store
    await loadFiles();
    setIsWiping(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-600 px-6 py-4 rounded-xl shadow">
          <p className="font-semibold">Error: {error}</p>
          <button
            className="mt-2 text-sm underline text-red-500"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">
          App Data Management
        </h1>

        <p className="text-gray-600">
          Authenticated as:{" "}
          <span className="font-medium text-gray-800">
            {auth.user?.username}
          </span>
        </p>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Existing Files
          </h2>
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border"
                >
                  <p className="text-gray-800">{file.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No files found</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl shadow transition disabled:opacity-50"
            onClick={handleDelete}
            disabled={isWiping || files.length === 0}
          >
            {isWiping ? "Wiping..." : "Wipe App Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WipeApp;
