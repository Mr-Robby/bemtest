var enbBemTechs = require('enb-bem-techs'),
	borschikTech = require('enb-borschik/techs/borschik'),
	isProd = process.env.YENV === 'production',
	fs = require('node-fs'),
	path = require('path'),
	bundles = 'desktop.bundles',
	sites = fs.readdirSync(bundles),
	folders = ['files', 'layout', 'module', 'template'];

module.exports = function(config) {

	sites.forEach(function(site) {

		var themeNodes = fs.readdirSync(path.join(bundles, site));

		for(var i = themeNodes.length-1; i--;){
			if (themeNodes[i] === "files") themeNodes.splice(i, 1);
		}

		themeNodes.forEach(function(themeNode) {

			var siteNode = path.join('desktop.bundles/', site, themeNode, '/*');


			config.nodes(siteNode, function(nodeConfig) {

				var dir = path.basename(nodeConfig.getPath()),
					node = path.join('liquid/', site, themeNode),
					targetDir = path.join('../../../../liquid/', site, themeNode, '?.liquid');

				if (!fs.existsSync(node)) {
					fs.mkdirSync(node, '0777', true);
				}
				if (dir !== site+'-'+themeNode+'-files') {

					nodeConfig.addTechs([
					// essential
						[require('enb/techs/file-provider'), { target: '?.bemjson.js' }],
						[enbBemTechs.levels, { levels: getDesktops(config) }],
						[enbBemTechs.files],
						[enbBemTechs.deps],
						//[enbBemTechs.levels],
						[enbBemTechs.bemjsonToBemdecl],
						// css
						[require('enb-stylus/techs/css-stylus')],
						// bemhtml
						[require('enb-bemxjst/techs/bemhtml-old'), { devMode: process.env.BEMHTML_ENV === 'development' }],
						// html
						[require('enb-bemxjst/techs/html-from-bemjson')],
						[require('enb/techs/file-copy'), {
							sourceTarget: '?.html',
							destTarget: targetDir
						}],


						// borschik
						[borschikTech, { sourceTarget: '?.css', destTarget: '_?.css', tech: 'cleancss', freeze: true, minify: isProd }]
						
					]);

				

				nodeConfig.addTargets([
						'_?.css',
						'?.bemhtml.js',
						targetDir
					]);

				}

			});

			var siteNode = path.join('desktop.bundles/', site, themeNode, site+'-'+themeNode+'-files');
			config.nodes(siteNode, function(nodeConfig) {
				var dir = path.dirname(nodeConfig.getPath()),
					base = path.basename(nodeConfig.getPath()),
					dirFiles = fs.readdirSync(dir),
					filesNode = path.join('liquid', site, 'files'),
					filesTarget = path.join('../../../../liquid', site, 'files', '?.bemdecl'),
					filesSource = path.join(dir, base, '?.bemdecl'),
					bemdeclFiles = [];
					dirFiles.forEach(function (dirFile) {
						
						if (dirFile === site+'-'+themeNode+'-files') return;

						var node = path.join(dir, dirFile),
							target = dirFile + '.bemdecl.js';

						nodeConfig.addTech([enbBemTechs.provideBemdecl, {
							node: node,
							target: target
						}]);

						bemdeclFiles.push(target);
					});

				nodeConfig.addTech([enbBemTechs.mergeBemdecl, { sources: bemdeclFiles, target: '../../files/?.bemdecl.js' }])

				nodeConfig.addTechs([
					[enbBemTechs.levels, { levels: getDesktops(config) }],
					[enbBemTechs.deps],
					[enbBemTechs.files],
					[require('enb-stylus/techs/css-stylus')]
				]);

				nodeConfig.addTargets(['../../files/?.bemdecl.js']);
			})

			var siteNode = path.join('desktop.bundles/', site, 'files');
			config.nodes(siteNode, function(nodeConfig) {
				var dir = path.dirname(nodeConfig.getPath()),
					base = path.basename(nodeConfig.getPath()),
					dirFiles = fs.readdirSync(dir),
					bemdeclFiles = [];
					console.log(dirFiles)
					dirFiles.forEach(function (dirFile) {
						
						if (dirFile !== 'files') return;

						var node = path.join(dir, dirFile),
							target = dirFile + 'asas.bemdecl.js';
							console.log(node, dir);
						// nodeConfig.addTech([enbBemTechs.provideBemdecl, {
						// 	node: node,
						// 	target: target,
						// 	source: site+'-'+themeNode+'-files.bemdecl.js'
						// }]);
						bemdeclFiles.push(target);
					});

				//nodeConfig.addTech([enbBemTechs.mergeBemdecl, { sources: bemdeclFiles, target: '../../files/?.bemdecl.js' }])


				//nodeConfig.addTargets(['../../files/?.bemdecl.js']);
			})
		})
	})
}

function getDesktops(config) {
	var sitesPath = [];
	sites.forEach(function(site) {
		sitesPath.push(path.join('common.blocks/', site))
	})

	var bemLevels = [
			{ path: 'libs/bem-core/common.blocks', check: false },
			{ path: 'libs/bem-core/desktop.blocks', check: false },
			//{ path: 'libs/bem-components/common.blocks', check: false }
		],
		addLevels = bemLevels.concat();
		
	return addLevels.map(function (level) {
		return config.resolvePath(level);
	});
}