// src/components/skeletons/SidebarSkeleton.jsx (UPDATED/NEW)
const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* *** HEADER SKELETON *** */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <div className="skeleton w-6 h-6 rounded-full"></div>
          <div className="skeleton h-4 w-16 hidden lg:block"></div>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>

      {/* *** CONTACTS SKELETON *** */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* *** PROFILE PIC SKELETON *** */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton w-12 h-12 rounded-full"></div>
            </div>

            {/* *** USER INFO SKELETON (only visible on larger screens) *** */}
            <div className="hidden lg:block space-y-1 flex-1">
              <div className="skeleton h-4 w-24"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;