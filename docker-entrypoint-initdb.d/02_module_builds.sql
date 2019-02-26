CREATE TABLE IF NOT EXISTS `discord_bot`.`module_builds_builds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `author` VARCHAR(45) NULL,
  `title` VARCHAR(45) NULL,
  `description` TEXT(255) NULL,
  `skills` TEXT(255) NULL,
  `stats` TEXT(255) NULL,
  `gear` VARCHAR(45) NULL,
  `class` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `class_idx` (`class` ASC),
  CONSTRAINT `class`
    FOREIGN KEY (`class`)
    REFERENCES `discord_bot`.`module_rodata_jobclasses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS `discord_bot`.`module_builds_tags` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(45) NULL,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `id_UNIQUE` (`id` ASC)
);

CREATE TABLE IF NOT EXISTS `discord_bot`.`module_builds_build_tag` (
  `buildid` INT NOT NULL,
  `tagid` INT NOT NULL,
  PRIMARY KEY (`buildid`, `tagid`),
  INDEX `tagid_idx` (`tagid` ASC),
  CONSTRAINT `buildid`
    FOREIGN KEY (`buildid`)
    REFERENCES `discord_bot`.`module_builds_builds` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `tagid`
    FOREIGN KEY (`tagid`)
    REFERENCES `discord_bot`.`module_builds_tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT IGNORE INTO `discord_bot`.`module_builds_builds`
	(`id`,
	`author`,
	`title`,
	`description`,
	`skills`,
	`stats`,
	`gear`,
	`class`)
	VALUES
		(1,
		'Jenks',
		'Jenks Assa PvM Builds: Dual Dagger',
		'',
		'__Thief:__\n- Double Attack 10\n- Improve Dodge 10\n- Envenom 6 (10)\n- Detoxify 1\n- Steal 10\n- Hiding 2 (8)\n\n__Assassin__\n- Right Hand Mastery 5\n- Left Hand Mastery 5\n- Cloaking 3 (10)\n- 41 bzw. 34 Restpunkte frei zu verteilen',
		'Str: 90-120\nAgi: 90-110\nVit: 1 - 30\nInt: 1-2\nDex: 32/42\nLuk: 1\n',
		'',
		12);

INSERT IGNORE INTO `discord_bot`.`module_builds_tags`
	(`id`, `name`)
	VALUES
		(1, 'assassin'),
		(2, 'assa'),
		(3, 'sin'),
		(4, 'dagger'),
		(5, 'dual dagger');

INSERT IGNORE INTO `discord_bot`.`module_builds_build_tag`
	(`buildid`,
	`tagid`)
	VALUES
	(1,1),
	(1,2),
	(1,3),
	(1,4),
	(1,5);
