<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
<xsl:output method="html" indent="yes"/>
<xsl:template match="/">
  <html>
    <head>
      <title>Sitemap</title>
    </head>
    <body>
      <h1>Sitemap</h1>
      <ul>
        <xsl:for-each select="urlset/url">
          <li><a href="{loc}"><xsl:value-of select="loc"/></a></li>
        </xsl:for-each>
      </ul>
    </body>
  </html>
</xsl:template>
</xsl:stylesheet>