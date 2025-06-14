package com.app;

import com.app.persistence.entity.PermissionEntity;
import com.app.persistence.entity.RoleEntity;
import com.app.persistence.entity.RoleEnum;
import com.app.persistence.entity.UserEntity;
import com.app.persistence.entity.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@SpringBootApplication
public class SpringSecurityAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringSecurityAppApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository) {
		return args -> {
			/* CREATE PERMISSIONS */
			PermissionEntity createPermission = PermissionEntity.builder()
					.name("CREATE")
					.build();

			PermissionEntity readPermission = PermissionEntity.builder()
					.name("READ")
					.build();

			PermissionEntity updatePermission = PermissionEntity.builder()
					.name("UPDATE")
					.build();

			PermissionEntity deletePermission = PermissionEntity.builder()
					.name("DELETE")
					.build();

			PermissionEntity refactorPermission = PermissionEntity.builder()
					.name("REFACTOR")
					.build();

			/* CREATE ROLES */
			RoleEntity roleAdmin = RoleEntity.builder()
					.roleEnum(RoleEnum.ADMIN)
					.permissionList(Set.of(createPermission, readPermission, updatePermission, deletePermission))
					.build();

			RoleEntity roleUser = RoleEntity.builder()
					.roleEnum(RoleEnum.USER)
					.permissionList(Set.of(createPermission, readPermission))
					.build();

			RoleEntity roleInvited = RoleEntity.builder()
					.roleEnum(RoleEnum.INVITED)
					.permissionList(Set.of(readPermission))
					.build();

			RoleEntity roleDeveloper = RoleEntity.builder()
					.roleEnum(RoleEnum.DEVELOPER)
					.permissionList(Set.of(createPermission, readPermission, updatePermission, deletePermission, refactorPermission))
					.build();

			/* CREATE USERS */
			UserEntity userAdmin = UserEntity.builder()
					.username("admin")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Admin")
					.surname("Admin")
					.picture("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiueyhP9Iv-HBNxhxIH_uPlBE-EJz04tPNwP3AqVi29c2TdFRAUNoAGi3-g7EDZUVgKD7fkQlVJCv5w0R0gzut9l__h6vVarXS9WcCNXMAd7bXL33BxhzZBLcJ9H7lJMFiSS3U1W_Cu1MBQ/s1600/thispersondoesnotexist-2.jpg")
					.bio("¡Qué tal, familia! Soy el que evita que este sitio se convierta en un caos total. Cuando no estoy eliminando spam o mediando en disputas tipo \"me prometió su vieja bici hace tres meses\", me escapo a montañas sin cobertura (¡bendita paz!). Tengo una colección de vinilos que uso principalmente para parecer interesante en primeras citas. Mi superpoder: resolver problemas mientras intento no derramar café sobre mi teclado. Si necesitas ayuda, estoy a un mensaje de distancia... ¡o posiblemente tomando mi quinta taza de café intentando no perder la cabeza!")
					.interests("Senderismo, Mediador, Música")
					.location("Montequinto, Dos Hermanas")
					.requestedFavours(6)
					.doneFavours(12)
					.birthday(LocalDate.of(1997, 2, 2))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleAdmin))
					.build();

			UserEntity userDaniel = UserEntity.builder()
					.username("daniel")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Daniel")
					.surname("García Ramírez")
					.picture("https://www.bjelic.net/wp-content/uploads/IMG_1312.jpg")
					.bio("Programador con ojeras profesionales y chef que aún no ha incendiado su cocina (¡éxito!). Mi golden retriever, Max, es quien realmente manda en casa. Intercambio soluciones informáticas por alguien que lo pasee cuando estoy en modo zombi por códigos. Me he visto Friends 17 veces y no me arrepiento. Si me traes café, literalmente haré cualquier cosa por ti. Advertencia: mis chistes sobre programación son terribles, pero mis pastas caseras compensan.")
					.interests("Mascotas, Informática, Gastronomía")
					.location("Getafe, Madrid")
					.requestedFavours(6)
					.doneFavours(8)
					.birthday(LocalDate.of(1992, 7, 22))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleUser))
					.build();

			UserEntity userAndrea = UserEntity.builder()
					.username("lucas")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Lucas")
					.surname("Sánchez Guernica")
					.picture("https://www.vicharkness.co.uk/wp-content/uploads/2019/03/aiface.png")
					.bio("Músico que todavía cree que será famoso (¡dejadme soñar!). Siempre llego tarde porque \"el tiempo es un concepto relativo\" (excusa oficial). Colecciono historias en bares y anécdotas de viajes que mejoran con cada cerveza. Puedo enseñarte tres acordes de guitarra y convencerte de que ya sabes tocar. Si necesitas un compañero para una aventura improvisada o alguien que te anime a tomar esa decisión loca, ¡ese soy yo! Advertencia: canto en la ducha como si estuviera en Wembley.")
					.interests("Música, Viajes, Psicología")
					.location("La Rinconada, Sevilla")
					.requestedFavours(3)
					.doneFavours(5)
					.birthday(LocalDate.of(2000, 4, 12))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleInvited))
					.build();

			UserEntity userNerea = UserEntity.builder()
					.username("nerea")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Nerea")
					.surname("Rodríguez Salgado")
					.picture("https://upload.wikimedia.org/wikipedia/commons/1/1f/Woman_1.jpg")
					.bio("Diseñadora con más plantas que espacio vital y yogui que sigue comiendo galletas a escondidas. Mis gatos, Frida y Dalí, son mis jefes y críticos de arte. Puedo transformar tu aburrido LinkedIn mientras charlamos sobre cualquier cosa, desde series hasta por qué siempre me acabo comiendo una pizza entera yo sola los viernes. Vegetariana que no te juzga (en voz alta) y que hace tartas que te harán llorar. Mi superpoder: encontrar objetos perdidos y excusas creativas para no salir de fiesta. Si me necesitas, estaré abrazando árboles o haciendo amigos en la fila del supermercado.")
					.interests("Diseño, Plantas, Dietética")
					.location("Huelín, Málaga")
					.requestedFavours(7)
					.doneFavours(5)
					.birthday(LocalDate.of(1997, 2, 5))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleDeveloper))
					.build();

			UserEntity userMario = UserEntity.builder()
					.username("mario")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Mario")
					.surname("Silva Hernández")
					.picture("https://i.postimg.cc/DZ9b9NTP/IMG-20190219-173118.jpg")
					.bio("Desarrollador que colecciona más tazas de café que líneas de código funcionales y gamer que sigue diciendo \"una partida más\" a las 3 AM. Mi setup tiene más luces RGB que una discoteca y mi planta de escritorio es mi única compañera que no me juzga por mis commits. Puedo debuggear tu vida mientras debatimos si meter piña a la pizza o por qué siempre termino viendo \"solo un episodio más\" hasta el amanecer. Carnívoro empedernido que cocina pasta como si fuera alta cocina y hace brownies que desafían las leyes de la física. Mi superpoder: arreglar cualquier dispositivo electrónico con un golpecito estratégico y encontrar bugs en producción justo antes de irme a dormir. Si me buscas, estaré optimizando algo que ya funcionaba perfectamente o explicándole a mi madre por qué necesito \"otra\" pantalla.")
					.interests("Ordenadores, Videojuegos, Patinaje")
					.location("Born, Barcelona")
					.requestedFavours(7)
					.doneFavours(5)
					.birthday(LocalDate.of(1997, 4, 5))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleInvited))
					.build();
			
			UserEntity userMar = UserEntity.builder()
					.username("mar")
					.password("$2a$10$efgd0aGK80eQpBfV.lYzjeWshnaligSuBleTWThV1xR1lpXw8Ktwe")
					.name("Mar")
					.surname("González Márquez")
					.picture("https://images.fastcompany.com/image/upload/f_webp,q_auto,c_fit,w_1024,h_1024/wp-cms/uploads/2019/02/5-create-fake-people-in-2-seconds-on-this-insane-site.jpg")
					.bio("Recién aterrizada en esta ciudad con mis cajas aún por deshacer y una colección impresionante de plantas que han sobrevivido a tres mudanzas (milagro). Treintañera que sigue sin saber qué quiere ser de mayor pero que hace una tortilla española que te cambiaría la vida. Mis planes de fin de semana oscilan entre explorar cada café del barrio y quedarme en pijama viendo documentales sobre crímenes reales mientras como helado directamente del bote. Lectora empedernida que siempre lleva un libro en el bolso \"por si acaso\" y que puede mantener conversaciones larguísimas sobre cualquier tema, desde por qué los calcetines desaparecen en la lavadora hasta teorías conspirativas sobre las palomas urbanas. Mi superpoder: hacer que cualquier espacio parezca acogedor en tiempo récord y recordar cumpleaños mejor que el mismísimo calendario.")
					.interests("Ordenadores, Videojuegos, Patinaje")
					.location("Getafe, Madrid")
					.requestedFavours(6)
					.doneFavours(5)
					.birthday(LocalDate.of(1990, 2, 15))
					.isEnabled(true)
					.accountNoExpired(true)
					.accountNoLocked(true)
					.credentialNoExpired(true)
					.roles(Set.of(roleInvited))
					.build();

			userRepository.saveAll(List.of(userAdmin, userDaniel, userAndrea, userNerea, userMario, userMar));
		};
	}
}
