import { prisma } from "@/lib/prisma";
import { DEMO_USER_EMAIL } from "@/lib/demo";
import { createActivity, formatActivityMessage } from "@/lib/activity";

export async function getOrCreateDemoUser() {
  let user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: "Демо-пользователь",
        passwordHash: null
      }
    });
    await seedDemoData(user.id);
  } else {
    const projectCount = await prisma.projectMember.count({
      where: { userId: user.id }
    });
    if (projectCount === 0) await seedDemoData(user.id);
  }
  return user;
}

async function seedDemoData(demoUserId: string) {
  const website = await prisma.project.create({
    data: {
      name: "Website",
      description: "Демо-проект: разработка веб-сайта",
      ownerId: demoUserId
    }
  });
  await prisma.projectMember.create({
    data: { projectId: website.id, userId: demoUserId, role: "OWNER" }
  });

  const mobile = await prisma.project.create({
    data: {
      name: "Mobile App",
      description: "Демо-проект: мобильное приложение",
      ownerId: demoUserId
    }
  });
  await prisma.projectMember.create({
    data: { projectId: mobile.id, userId: demoUserId, role: "OWNER" }
  });

  const now = new Date();
  const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const t1 = await prisma.task.create({
    data: {
      projectId: website.id,
      title: "Сделать экран входа",
      description: "Форма логина и восстановление пароля",
      status: "DONE",
      priority: "HIGH",
      deadline: yesterday,
      assigneeId: demoUserId,
      order: 0
    }
  });
  const t2 = await prisma.task.create({
    data: {
      projectId: website.id,
      title: "Улучшить UX/UI",
      description: "Доработать компоненты и навигацию",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      deadline: inWeek,
      assigneeId: demoUserId,
      order: 1
    }
  });
  const t3 = await prisma.task.create({
    data: {
      projectId: website.id,
      title: "Задеплоить проект",
      description: "Настроить CI/CD и выкатить на прод",
      status: "TODO",
      priority: "HIGH",
      deadline: inTwoWeeks,
      assigneeId: demoUserId,
      order: 2
    }
  });

  await prisma.subtask.createMany({
    data: [
      { taskId: t1.id, title: "Верстка формы", isCompleted: true },
      { taskId: t1.id, title: "Валидация полей", isCompleted: true },
      { taskId: t2.id, title: "Обновить дизайн-систему", isCompleted: false }
    ]
  });

  const t4 = await prisma.task.create({
    data: {
      projectId: mobile.id,
      title: "Настроить навигацию",
      description: "Bottom tabs и stack навигация",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: inWeek,
      assigneeId: demoUserId,
      order: 0
    }
  });
  const t5 = await prisma.task.create({
    data: {
      projectId: mobile.id,
      title: "Добавить onboarding",
      description: "Экраны приветствия для новых пользователей",
      status: "TODO",
      priority: "MEDIUM",
      deadline: inTwoWeeks,
      assigneeId: demoUserId,
      order: 1
    }
  });
  const t6 = await prisma.task.create({
    data: {
      projectId: mobile.id,
      title: "Исправить баг с авторизацией",
      description: "Токен не обновляется при истечении",
      status: "REVIEW",
      priority: "HIGH",
      deadline: now,
      assigneeId: demoUserId,
      order: 2
    }
  });

  await prisma.subtask.createMany({
    data: [
      { taskId: t4.id, title: "Подключить React Navigation", isCompleted: true },
      { taskId: t6.id, title: "Проверить refresh token", isCompleted: false }
    ]
  });

  const demoName = "Демо-пользователь";
  await createActivity({
    userId: demoUserId,
    projectId: website.id,
    type: "PROJECT_CREATED",
    message: formatActivityMessage("PROJECT_CREATED", demoName)
  });
  await createActivity({
    userId: demoUserId,
    projectId: website.id,
    type: "TASK_CREATED",
    message: formatActivityMessage("TASK_CREATED", demoName, { taskTitle: t1.title }),
    taskId: t1.id
  });
  await createActivity({
    userId: demoUserId,
    projectId: website.id,
    type: "TASK_STATUS_CHANGED",
    message: formatActivityMessage("TASK_STATUS_CHANGED", demoName, {
      taskTitle: t1.title,
      newValue: "DONE"
    }),
    taskId: t1.id
  });
  await createActivity({
    userId: demoUserId,
    projectId: mobile.id,
    type: "PROJECT_CREATED",
    message: formatActivityMessage("PROJECT_CREATED", demoName)
  });
  await createActivity({
    userId: demoUserId,
    projectId: mobile.id,
    type: "TASK_CREATED",
    message: formatActivityMessage("TASK_CREATED", demoName, { taskTitle: t4.title }),
    taskId: t4.id
  });
}
