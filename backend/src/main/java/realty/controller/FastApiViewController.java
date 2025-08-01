package realty.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class FastApiViewController {
    

    @GetMapping("/api-test")
    public String apiTestPage() {
        return "api-test/api-test";
    }
    
}
