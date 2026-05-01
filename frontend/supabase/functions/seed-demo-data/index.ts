import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const password = "Demo1234!";

  const users = [
    { email: "student@demo.nexford.edu", first_name: "Ada", last_name: "Johnson", role: "student" },
    { email: "lecturer@demo.nexford.edu", first_name: "Dr. Emeka", last_name: "Okafor", role: "lecturer" },
    { email: "admin@demo.nexford.edu", first_name: "Fatima", last_name: "Ibrahim", role: "admin" },
    { email: "superadmin@demo.nexford.edu", first_name: "Chidi", last_name: "Nwosu", role: "super_admin" },
  ];

  const createdUsers: Record<string, { authId: string; profileId: string }> = {};

  // Create auth users
  for (const u of users) {
    // Delete existing user with same email first
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((eu: any) => eu.email === u.email);
    if (existing) {
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
      // Small delay for trigger cleanup
      await new Promise(r => setTimeout(r, 500));
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role },
    });
    if (error) {
      return new Response(JSON.stringify({ error: `Failed to create ${u.email}: ${error.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    createdUsers[u.role] = { authId: data.user.id, profileId: "" };
  }

  // Wait for triggers to create profiles
  await new Promise(r => setTimeout(r, 2000));

  // Get profile IDs
  for (const role of Object.keys(createdUsers)) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", createdUsers[role].authId)
      .single();
    if (profile) createdUsers[role].profileId = profile.id;
  }

  // Create institution
  const { data: inst } = await supabaseAdmin
    .from("institutions")
    .upsert({ code: "NEXFORD", name: "Nexford University", city: "Lagos", state: "Lagos", address: "12 Victoria Island", is_active: true, subscription_plan: "pro" }, { onConflict: "code" })
    .select("id")
    .single();

  const instId = inst!.id;

  // Update profiles with institution
  for (const role of Object.keys(createdUsers)) {
    await supabaseAdmin.from("profiles").update({ institution_id: instId }).eq("id", createdUsers[role].profileId);
  }

  // Assign staff_id / matric_number
  await supabaseAdmin.from("profiles").update({ matric_number: "NEX/CSC/2025/001" }).eq("id", createdUsers["student"].profileId);
  await supabaseAdmin.from("profiles").update({ staff_id: "NEX/STF/001", department: "Computer Science" }).eq("id", createdUsers["lecturer"].profileId);
  await supabaseAdmin.from("profiles").update({ staff_id: "NEX/ADM/001", department: "Administration" }).eq("id", createdUsers["admin"].profileId);

  // Create departments
  const deptData = [
    { code: "CSC", name: "Computer Science", institution_id: instId },
    { code: "ENG", name: "English & Literature", institution_id: instId },
    { code: "BUS", name: "Business Administration", institution_id: instId },
  ];
  const { data: depts } = await supabaseAdmin.from("departments").upsert(deptData, { onConflict: "code,institution_id" }).select("id, code");

  // If upsert doesn't work due to no unique constraint, try insert with conflict handling
  let departmentMap: Record<string, string> = {};
  if (depts && depts.length > 0) {
    for (const d of depts) departmentMap[d.code] = d.id;
  } else {
    // Delete existing and re-insert
    await supabaseAdmin.from("departments").delete().eq("institution_id", instId);
    const { data: newDepts } = await supabaseAdmin.from("departments").insert(deptData).select("id, code");
    if (newDepts) for (const d of newDepts) departmentMap[d.code] = d.id;
  }

  const cscDeptId = departmentMap["CSC"];

  // Create courses
  const coursesData = [
    { code: "CSC101", title: "Introduction to Computer Science", description: "Fundamentals of computing and programming", institution_id: instId, department_id: cscDeptId, lecturer_id: createdUsers["lecturer"].profileId, credit_units: 3, level: 100, semester: "first" },
    { code: "CSC201", title: "Data Structures & Algorithms", description: "Arrays, linked lists, trees, sorting and searching algorithms", institution_id: instId, department_id: cscDeptId, lecturer_id: createdUsers["lecturer"].profileId, credit_units: 4, level: 200, semester: "first" },
    { code: "CSC301", title: "Database Management Systems", description: "Relational databases, SQL, normalization and design", institution_id: instId, department_id: cscDeptId, lecturer_id: createdUsers["lecturer"].profileId, credit_units: 3, level: 300, semester: "second" },
  ];

  // Clear old courses for this institution to avoid duplicates
  await supabaseAdmin.from("assignments").delete().in("course_id", 
    (await supabaseAdmin.from("courses").select("id").eq("institution_id", instId)).data?.map((c: any) => c.id) || []
  );
  await supabaseAdmin.from("enrollments").delete().in("course_id",
    (await supabaseAdmin.from("courses").select("id").eq("institution_id", instId)).data?.map((c: any) => c.id) || []
  );
  await supabaseAdmin.from("courses").delete().eq("institution_id", instId);

  const { data: courses } = await supabaseAdmin.from("courses").insert(coursesData).select("id, code");

  const courseMap: Record<string, string> = {};
  if (courses) for (const c of courses) courseMap[c.code] = c.id;

  // Enroll student in all courses
  const enrollData = Object.values(courseMap).map(cid => ({
    course_id: cid,
    student_id: createdUsers["student"].profileId,
    status: "enrolled",
  }));
  await supabaseAdmin.from("enrollments").insert(enrollData);

  // Create assignments
  const now = new Date();
  const assignmentsData = [
    { title: "Programming Basics Quiz", description: "Multiple choice quiz on variables, loops, and functions", course_id: courseMap["CSC101"], due_date: new Date(now.getTime() + 7 * 86400000).toISOString(), created_by: createdUsers["lecturer"].profileId, is_published: true, max_score: 20, assignment_type: "quiz" },
    { title: "Build a Calculator App", description: "Create a simple calculator using Python or JavaScript", course_id: courseMap["CSC101"], due_date: new Date(now.getTime() + 14 * 86400000).toISOString(), created_by: createdUsers["lecturer"].profileId, is_published: true, max_score: 100, assignment_type: "assignment" },
    { title: "Linked List Implementation", description: "Implement singly and doubly linked lists with insert, delete, and search operations", course_id: courseMap["CSC201"], due_date: new Date(now.getTime() + 10 * 86400000).toISOString(), created_by: createdUsers["lecturer"].profileId, is_published: true, max_score: 50, assignment_type: "assignment" },
    { title: "SQL Query Exercises", description: "Write SQL queries for the given database schema", course_id: courseMap["CSC301"], due_date: new Date(now.getTime() + 21 * 86400000).toISOString(), created_by: createdUsers["lecturer"].profileId, is_published: true, max_score: 40, assignment_type: "assignment" },
  ];
  await supabaseAdmin.from("assignments").insert(assignmentsData);

  // Create course materials
  const materialsData = [
    { title: "Week 1: Introduction to Programming", description: "Overview of programming concepts and paradigms", course_id: courseMap["CSC101"], uploaded_by: createdUsers["lecturer"].profileId, file_type: "pdf" },
    { title: "Week 2: Variables and Data Types", description: "Understanding primitive and complex data types", course_id: courseMap["CSC101"], uploaded_by: createdUsers["lecturer"].profileId, file_type: "pdf" },
    { title: "Algorithm Complexity Cheat Sheet", description: "Big O notation reference guide", course_id: courseMap["CSC201"], uploaded_by: createdUsers["lecturer"].profileId, file_type: "pdf" },
  ];
  await supabaseAdmin.from("course_materials").insert(materialsData);

  return new Response(JSON.stringify({
    success: true,
    message: "Demo data seeded successfully!",
    logins: users.map(u => ({ email: u.email, password, role: u.role })),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
