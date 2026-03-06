
-- =============================================
-- NexfordEdu Database Schema
-- =============================================

-- 1. Roles enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('student', 'lecturer', 'admin', 'super_admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions viewable by authenticated users"
  ON public.institutions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage institutions"
  ON public.institutions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  institution_id UUID REFERENCES public.institutions(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  matric_number TEXT,
  staff_id TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  hod_id UUID REFERENCES public.profiles(id),
  matric_prefix TEXT,
  matric_separator TEXT DEFAULT '/',
  matric_sequence_start INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Departments viewable by authenticated"
  ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 5. Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credit_units INTEGER DEFAULT 3,
  level INTEGER DEFAULT 100,
  semester TEXT DEFAULT 'first',
  lecturer_id UUID REFERENCES public.profiles(id),
  max_students INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses viewable by authenticated"
  ON public.courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecturers can update their courses"
  ON public.courses FOR UPDATE TO authenticated
  USING (lecturer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 6. Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrollments viewable by participants"
  ON public.enrollments FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'lecturer')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Students can enroll"
  ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can update enrollment"
  ON public.enrollments FOR UPDATE TO authenticated
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 7. Course Materials
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials viewable by authenticated"
  ON public.course_materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecturers can manage materials"
  ON public.course_materials FOR ALL TO authenticated
  USING (uploaded_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'));

-- 8. Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  assignment_type TEXT DEFAULT 'assignment' CHECK (assignment_type IN ('assignment', 'quiz', 'project', 'exam')),
  file_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments viewable by authenticated"
  ON public.assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lecturers can manage assignments"
  ON public.assignments FOR ALL TO authenticated
  USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'));

-- 9. Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  content TEXT,
  score INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'late')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  graded_at TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions viewable by participants"
  ON public.submissions FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'lecturer')
    OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can create submissions"
  ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Lecturers can grade"
  ON public.submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'lecturer') OR public.has_role(auth.uid(), 'admin'));

-- 10. Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  method TEXT DEFAULT 'manual' CHECK (method IN ('manual', 'facial_recognition', 'qr_code')),
  confidence_score NUMERIC(5,2),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance viewable by participants"
  ON public.attendance FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'lecturer')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lecturers can mark attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'lecturer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lecturers can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'lecturer') OR public.has_role(auth.uid(), 'admin'));

-- 11. Results
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ca_score NUMERIC(5,2) DEFAULT 0,
  exam_score NUMERIC(5,2) DEFAULT 0,
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
  grade TEXT,
  semester TEXT,
  academic_year TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, student_id, semester, academic_year)
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results viewable by participants"
  ON public.results FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'lecturer')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lecturers can manage results"
  ON public.results FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'lecturer') OR public.has_role(auth.uid(), 'admin'));

-- 12. Discussions
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions viewable by authenticated"
  ON public.discussions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create discussions"
  ON public.discussions FOR INSERT TO authenticated
  WITH CHECK (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can update discussions"
  ON public.discussions FOR UPDATE TO authenticated
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors and staff can delete discussions"
  ON public.discussions FOR DELETE TO authenticated
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'lecturer')
    OR public.has_role(auth.uid(), 'admin'));

-- 13. Timetable
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  department_id UUID REFERENCES public.departments(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  level INTEGER,
  semester TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timetable viewable by authenticated"
  ON public.timetable FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage timetable"
  ON public.timetable FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 14. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'academic', 'financial', 'security')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);

-- Storage policies
CREATE POLICY "Avatar images publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "View course materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-materials');

CREATE POLICY "Upload course materials"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "View assignments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'assignments');

CREATE POLICY "Upload assignments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assignments');

CREATE POLICY "Upload submissions"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "View submissions"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'submissions');
