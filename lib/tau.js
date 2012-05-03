/*
   Copyright (c) 2012 KT Corp.
  
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Lesser General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public License
   along with This program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function (libs) {
  /**
   * loads specified library file related to Mobello Framework.
   * specified library must be loaded prior to user application.
   * the notation of 'lib' will be as follows <p/>
   * the prefix 'tau' can be omitted. if the lib name is not starting with
   * 'tau' then it prepend 'tau' automatically.
   * you need not append the extension '.js' to the lib name. <p/>
   * If you want to load library 'tau.core.js', just specify 'core' as a
   * library name
   * 
   * @param lib {string} library name(javascript file)
   */
  function require(lib) {
    try {
      document.write('<script type="text/javascript" src="' + lib + '"><\/script>');
    } catch (e) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = lib;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  /**
   * loads required libraries onto the head area
   * @param head {object} HTML head element
   * @param required {string} library names separated by comma
   */
  function load(head, required) {
    var i, j, s, path,
        ts = new Date().getTime(),
        scripts = head.getElementsByTagName('script'),
        expr = /tau\.js(\?.*)?$/;
    for (i = 0; i < scripts.length; i++) {
      if (scripts[i].src.match(expr)) {
        path = scripts[i].src.replace(expr, '');
        for (j = 0; j < required.length; j++) {
          s = required[j];
          if (s.indexOf('tau.') !== 0) {
            s = 'tau.'.concat(s);
          }
          s = path.concat(s, '.js');
          require(noCache ? s.concat('?', ts) : s);
        }
      }
    }
    return true;
  }
  
  var parts = /[\\?&]dev=([^&#]*)/.exec(document.URL),
      noCache = (parts && parts[1]) ? ('true' === parts[1]) : false,
      head = document.getElementsByTagName('head')[0];
  if (!(head && load(head, libs.split(',')))) {
    alert('Failed to load Mobello Framework!');
  }
})('core,util,rt,data,fx,ui.comp,ui.ctrl,ui.renderer');