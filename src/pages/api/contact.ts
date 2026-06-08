export const prerender = false;

import { Resend } from 'resend';

// Inicializar Resend con la variable de entorno
const resend = new Resend(import.meta.env.RESEND_API_KEY || 're_cee2zg8s_2ZV63uni6dEV29hderi9k6Dt');

export const POST = async ({ request }) => {
    try {
        const data = await request.formData();
        const name = data.get('name')?.toString();
        const email = data.get('email')?.toString();
        const phone = data.get('phone')?.toString();
        const message = data.get('message')?.toString();
        const gotcha = data.get('_gotcha')?.toString();
        const recaptchaToken = data.get('recaptcha_token')?.toString();

        // 1. Validación Honeypot (Anti-Bot)
        if (gotcha) {
            return new Response(JSON.stringify({ success: true }), { status: 200 }); // Simulamos éxito para confundir al bot
        }

        // 2. Validación de campos obligatorios
        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
        }

        // 3. Validación reCAPTCHA v3 (Servidor)
        // Nota: Solo se ejecutará realmente si se ha configurado el RECAPTCHA_SECRET_KEY en Vercel.
        const recaptchaSecret = import.meta.env.RECAPTCHA_SECRET_KEY;
        if (recaptchaSecret && recaptchaToken) {
            const recaptchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, {
                method: 'POST'
            });
            const recaptchaRes = await recaptchaVerify.json();
            
            if (!recaptchaRes.success || recaptchaRes.score < 0.5) {
                return new Response(JSON.stringify({ error: 'Fallo de validación de seguridad (reCAPTCHA)' }), { status: 400 });
            }
        }

        // 4. Enviar correo al propietario (R. Rojas)
        await resend.emails.send({
            from: 'Vive Domos <contacto@vivedomos.cl>',
            to: 'rrojas@vivedomos.cl',
            subject: `Nueva Cotización: ${name} (Vive Domos)`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1a1c1a;">
                    <h2 style="color: #1e453e;">Nueva Cotización de Domo</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                    <br>
                    <p><strong>Mensaje:</strong></p>
                    <p style="padding: 15px; background: #f7f6f2; border-left: 4px solid #d98852;">
                        ${message.replace(/\n/g, '<br>')}
                    </p>
                </div>
            `
        });

        // 5. Autorespondedor al Cliente
        await resend.emails.send({
            from: 'Vive Domos <contacto@vivedomos.cl>',
            to: email,
            subject: 'Recibimos tu cotización - Vive Domos',
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <div style="background-color: #1e453e; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">VIVE DOMOS</h1>
                    </div>
                    <div style="padding: 40px 30px; background-color: #f7f6f2;">
                        <h2 style="color: #122b27; margin-top: 0;">¡Hola ${name}! 👋</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hemos recibido tu solicitud de cotización correctamente. Nuestro equipo ya está revisando los detalles de tu proyecto.
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Nos pondremos en contacto contigo en <strong>menos de 24 horas</strong> para asesorarte de manera personalizada.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        <h3 style="color: #122b27;">¿Por qué elegir Vive Domos?</h3>
                        <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; padding-left: 20px;">
                            <li>Estructuras de alta resistencia y durabilidad.</li>
                            <li>Diseños premium llave en mano.</li>
                            <li>Aislamiento térmico de primer nivel.</li>
                            <li>Cobertura en todo Chile.</li>
                        </ul>
                    </div>
                    <div style="background-color: #122b27; padding: 20px; text-align: center; color: #9ca3af; font-size: 13px;">
                        <p style="margin: 0;">Vive Domos - Construcción de Domos Geodésicos</p>
                        <p style="margin: 5px 0 0 0;">La Serena, Región de Coquimbo, Chile</p>
                    </div>
                </div>
            `
        });

        return new Response(JSON.stringify({ success: true, message: 'Correos enviados exitosamente' }), { status: 200 });

    } catch (error) {
        console.error("Error enviando correos:", error);
        return new Response(JSON.stringify({ error: 'Hubo un error al procesar la solicitud' }), { status: 500 });
    }
};
