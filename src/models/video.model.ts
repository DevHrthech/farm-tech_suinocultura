import { COURSE_IDS } from "./course.model";

export interface Video {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  youtubeVideoId: string;
  createdAt: string;
}

const videos: Video[] = [
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.MANEJO_MATERNIDADE,
    title: "Suinocultura - Manejos na Maternidade EP.1 - Transferência da matriz e acompanhamento de parto",
    youtubeVideoId: "giCN9paH5DM",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.MANEJO_MATERNIDADE,
    title: "Manejos na Maternidade EP.2 - Cuidados iniciais com os leitões e registro de nascimento",
    youtubeVideoId: "BdcY8TGKLh0",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.NUTRICAO_LEITOES,
    title: "Zootecnia Digital - Ciclo de Palestras: Nutrição e Produção de Não Ruminantes - Dia 14/06/2021",
    youtubeVideoId: "HfH5Jf0zi3Y",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.NUTRICAO_LEITOES,
    title: "Zootecnia Digital - Ciclo de Palestras: Nutrição e Produção de Não Ruminantes - Dia 15/06/2021",
    youtubeVideoId: "HtK5_4SYBVg",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.SANIDADE_MATERNIDADE,
    title: "A importância da biosseguridade para o controle e prevenção de doenças - Minuto Agro Suínos",
    youtubeVideoId: "RMgx-uZmWng",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "tenant-1",
    courseId: COURSE_IDS.SANIDADE_MATERNIDADE,
    title: "Biosseguridade em granjas de suínos - Embrapa Suínos e Aves",
    youtubeVideoId: "nWv78XLtEZ0",
    createdAt: new Date().toISOString(),
  },
];

export const VideoModel = {
  findByCourseId: (courseId: string, tenantId: string) =>
    videos.filter((v) => v.courseId === courseId && v.tenantId === tenantId),

  findById: (id: string, tenantId: string) =>
    videos.find((v) => v.id === id && v.tenantId === tenantId),

  findAll: (tenantId: string) =>
    videos.filter((v) => v.tenantId === tenantId),
};
