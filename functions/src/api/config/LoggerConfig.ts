import { logger, errorLogger } from "express-winston";
import * as winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

const transports:any = [new LoggingWinston({})];

if(process.env.NODE_ENV === "development") {
  transports.pop(0);
  transports.push(new winston.transports.Console());
}


export const expressLog = logger({ 
    transports: transports,
    format: winston.format.combine(
      // winston.format.colorize(),
      winston.format.json()
    ),
    requestWhitelist: ["headers", "query"],
    responseWhitelist: [],
    headerBlacklist:["x-access-token", "Authorization", "authorization"],
    dynamicMeta: (req:any, res:any) => {
      const httpRequest:any = {};
        const meta:any = {};
  
      if (req) {
          // meta.httpRequest = httpRequest
          httpRequest.requestMethod = req.method;
          httpRequest.requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
          httpRequest.protocol = `HTTP/${req.httpVersion}`;
          httpRequest.uid = req.headers.uid || "";
          httpRequest.userRecord  = req.headers.userRecord? req.headers.userRecord.email: "";
          // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
          // logger('remoteIp', req);
          if(req.ip){
            httpRequest.remoteIp = req.ip.indexOf(":") >= 0 ? req.ip.substring(req.ip.lastIndexOf(":") + 1) : req.ip;   // just ipv4
    
          }
          httpRequest.requestSize = req.socket.bytesRead;
          httpRequest.userAgent = req.get("User-Agent");
          httpRequest.referrer = req.get("Referrer");
        }
        if (res) {
          //meta.httpRequest = httpRequest
          httpRequest.status = res.statusCode;
          httpRequest.latency = {
            seconds: Math.floor(res.responseTime / 1000),
            nanos: ( res.responseTime % 1000 ) * 1000000
          };
          if (res.body) {
            if (typeof res.body === "object") {
              httpRequest.responseSize = JSON.stringify(res.body).length;
            } else if (typeof res.body === "string") {
              httpRequest.responseSize = res.body.length;
            }
          }
        }
        return meta;
    },
    level: (req, res) => {
      let level = "";
      if (res.statusCode >= 100) { level = "info"; }
      if (res.statusCode >= 400) { level = "warn"; }
      if (res.statusCode >= 500) { level = "error"; }
      // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
      if (res.statusCode === 401 || res.statusCode === 403) { level = "error"; }
      // No one should be using the old path, so always warn for those
      // if (req.path === "/v1" && level === "info") { level = "warn"; }
      return level;
    }
  });

export const errorLog = errorLogger({
    transports: transports,
    format: winston.format.combine(
      // winston.format.colorize(),
      winston.format.json()
    )
});


export const Log = winston.createLogger({
    level: "info",
    transports: transports
});