# SINERGIA APP: API de Gestión Clínica y Citas

![Portada del proyecto](assets/sinergia_logo.jpg)

---

## Descripción del Proyecto

**SINERGIA APP** es una plataforma de software diseñada para optimizar la gestión de citas y expedientes de pacientes en un entorno clínico. Este repositorio contiene el backend del sistema, construido bajo una arquitectura modular y escalable.

El ecosistema de la API está compuesto por los siguientes módulos fundamentales:

1. **Autenticación y Seguridad (Auth/Users):** Sistema de registro y login de usuarios protegido mediante JSON Web Tokens (JWT) y encriptación de contraseñas. Implementa guardias (`Guards`) para el control de acceso basado en roles.
2. **Gestión de Citas (Appointments):** Módulo transaccional para agendar citas clínicas. Incluye reglas de negocio estrictas como validación de disponibilidad en tiempo real, protección contra empalme de horarios y políticas de cancelación (mínimo 24 horas de anticipación).
3. **Persistencia de Datos (Prisma ORM):** Gestión integral de la base de datos relacional (MySQL) asegurando la integridad referencial entre pacientes y citas médicas.

---

## Objetivos

### Objetivo General
Desarrollar una API RESTful segura, eficiente y automatizada para el control de pacientes y la programación de citas clínicas, garantizando la integridad de los datos, el manejo correcto de zonas horarias y un control de acceso estructurado.

---

## Recursos del Proyecto

Para conocer a detalle las especificaciones y la planeación ágil detrás de SINERGIA APP, puedes consultar los siguientes enlaces:

* 📄 **Documento de Requerimientos:** [Ver Especificaciones en Google Docs](https://docs.google.com/document/d/1-wiI7UCk-STEgVsSuPqDzBsWbg4HSS3D9wVY8jRvm6M/edit?usp=sharing)
* 📋 **Gestión Ágil y Tareas:** [Ver Tablero en Jira Software](https://alehernandez028h.atlassian.net/?continue=https%3A%2F%2Falehernandez028h.atlassian.net%2Fwelcome%2Fsoftware%3FprojectId%3D10000&atlOrigin=eyJpIjoiMDcwZWIwM2Q4Y2ZlNDQxNWJiYWNmN2VjYmY0NjA4N2IiLCJwIjoiamlyYS1zb2Z0d2FyZSJ9)

---

## Stack Tecnológico

* **Framework:** [NestJS](https://nestjs.com/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Base de Datos:** MySQL
* **Seguridad:** Passport, JWT, bcrypt
* **Entorno:** Node.js, TypeScript

---

## Equipo de Trabajo - Grupo 9AX

* Ángel Antelmo Gutiérrez Gadea
* Genaro Alfredo Silva Espinoza
* Daniel Olivares Morales
* Alejandro Hernández Hernández

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

## Instalación y Configuración Local

1. Clonar el repositorio.
2. Instalar las dependencias:
   ```bash
   npm install