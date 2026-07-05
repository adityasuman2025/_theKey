"use client";

import { memo, useCallback } from "react";

type Course = { id: string; title: string };

type TabButtonProps = {
  course: Course;
  isActive: boolean;
  onSelect: (id: string | null) => void;
};

const TabButton = function TabButton({ course, isActive, onSelect }: TabButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(course.id);
  }, [course.id, onSelect]);

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`course-tab-btn ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      {course.title}
    </button>
  );
};

const MemoizedTabButton = memo(TabButton);

type Props = {
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (id: string | null) => void;
};

const CourseTabs = function CourseTabs({
  courses,
  activeCourseId,
  onSelectCourse,
}: Props) {
  return (
    <div className="course-tabs" role="tablist" aria-label="Course tabs">
      {courses.map((c) => (
        <MemoizedTabButton
          key={c.id}
          course={c}
          isActive={activeCourseId === c.id}
          onSelect={onSelectCourse}
        />
      ))}
    </div>
  );
};

export default memo(CourseTabs);
